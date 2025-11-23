import { prisma } from '@/lib/prisma';
import { Coupon, DiscountType } from '@prisma/client';

export class CouponService {
  /**
   * 쿠폰 코드 검증 및 할인 정보 반환
   */
  static async validateCoupon(
    code: string,
    courseId: string,
    userId: string,
    coursePrice: number
  ) {
    try {
      // 대소문자 구분 없이 쿠폰 찾기
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: {
            equals: code,
            mode: 'insensitive'
          },
          isActive: true
        },
        include: {
          applicableCourses: true,
          couponUsages: {
            where: {
              userId
            }
          }
        }
      });

      if (!coupon) {
        return {
          isValid: false,
          error: '존재하지 않는 쿠폰 코드입니다.'
        };
      }

      // 활성화 상태 확인
      if (!coupon.isActive) {
        return {
          isValid: false,
          error: '비활성화된 쿠폰입니다.'
        };
      }

      // 유효 기간 확인
      const now = new Date();
      if (coupon.validFrom > now) {
        return {
          isValid: false,
          error: '아직 사용할 수 없는 쿠폰입니다.'
        };
      }

      if (coupon.validUntil && coupon.validUntil < now) {
        return {
          isValid: false,
          error: '만료된 쿠폰입니다.'
        };
      }

      // 전체 사용 제한 확인
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return {
          isValid: false,
          error: '쿠폰 사용 한도를 초과했습니다.'
        };
      }

      // 사용자별 사용 제한 확인
      if (coupon.usageLimitPerUser &&
          coupon.couponUsages.length >= coupon.usageLimitPerUser) {
        return {
          isValid: false,
          error: '이미 사용한 쿠폰입니다.'
        };
      }

      // 특정 강의에만 적용 가능한 경우 확인
      if (coupon.applicableCourses.length > 0) {
        const isApplicable = coupon.applicableCourses.some(
          (cc) => cc.courseId === courseId
        );
        if (!isApplicable) {
          return {
            isValid: false,
            error: '이 강의에는 사용할 수 없는 쿠폰입니다.'
          };
        }
      }

      // 최소 구매 금액 확인
      if (coupon.minPurchaseAmount && coursePrice < coupon.minPurchaseAmount) {
        return {
          isValid: false,
          error: `최소 구매 금액 ₩${coupon.minPurchaseAmount.toLocaleString()}원 이상에서 사용 가능합니다.`
        };
      }

      // 할인 금액 계산
      const discountAmount = this.calculateDiscount(coupon, coursePrice);
      const finalAmount = coursePrice - discountAmount;

      return {
        isValid: true,
        coupon,
        discountAmount,
        finalAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      };
    } catch (error) {
      console.error('Coupon validation error:', error);
      return {
        isValid: false,
        error: '쿠폰 검증 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 할인 금액 계산
   */
  static calculateDiscount(coupon: Coupon, originalAmount: number): number {
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      // 퍼센트 할인
      let discount = Math.floor(originalAmount * (coupon.discountValue / 100));

      // 최대 할인 금액 제한
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }

      return discount;
    } else {
      // 고정 금액 할인
      // 할인 금액이 상품 가격보다 큰 경우 상품 가격만큼만 할인
      return Math.min(coupon.discountValue, originalAmount);
    }
  }

  /**
   * 쿠폰 사용 기록 생성 및 사용 횟수 증가
   */
  static async applyCoupon(
    couponId: string,
    purchaseId: string,
    userId: string,
    discountAmount: number
  ) {
    return await prisma.$transaction(async (tx) => {
      // 쿠폰 사용 기록 생성
      const usage = await tx.couponUsage.create({
        data: {
          couponId,
          purchaseId,
          userId,
          discountAmount
        }
      });

      // 쿠폰 사용 횟수 증가
      await tx.coupon.update({
        where: { id: couponId },
        data: {
          usageCount: {
            increment: 1
          }
        }
      });

      return usage;
    });
  }

  /**
   * 고유한 쿠폰 코드 생성
   */
  static async generateUniqueCode(prefix: string = 'COUPON'): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let code = prefix;
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // 중복 확인
      const existing = await prisma.coupon.findUnique({
        where: { code }
      });

      if (!existing) {
        return code;
      }

      attempts++;
    }

    // 타임스탬프를 추가하여 유니크하게 만들기
    return `${prefix}${Date.now().toString(36).toUpperCase()}`;
  }
}