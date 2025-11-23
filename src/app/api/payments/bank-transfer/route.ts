import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { CouponService } from '@/lib/services/coupon.service';

// 무통장입금 요청 스키마
const bankTransferSchema = z.object({
  courseId: z.string(),
  buyerName: z.string(),
  buyerEmail: z.string().email(),
  buyerPhone: z.string(),
  depositorName: z.string(),
  expectedDepositDate: z.string(), // ISO date string
  couponCode: z.string().optional(), // 쿠폰 코드 (선택사항)
});

// POST /api/payments/bank-transfer - 무통장입금 요청
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, buyerName, buyerEmail, buyerPhone, depositorName, expectedDepositDate, couponCode } =
      bankTransferSchema.parse(body);

    // 강의 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true, isPublished: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!course.isPublished) {
      return NextResponse.json(
        { error: '비공개 강의는 구매할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 이미 구매했는지 확인
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: '이미 수강 중인 강의입니다.' },
        { status: 400 }
      );
    }

    // 쿠폰 검증 (선택사항)
    let couponValidation = null;
    let finalAmount = course.price;
    let discountAmount = 0;

    if (couponCode) {
      couponValidation = await CouponService.validateCoupon(
        couponCode,
        courseId,
        session.user.id,
        course.price
      );

      if (!couponValidation.isValid) {
        return NextResponse.json(
          { error: couponValidation.error },
          { status: 400 }
        );
      }

      finalAmount = couponValidation.finalAmount || course.price;
      discountAmount = couponValidation.discountAmount || 0;
    }

    // 기존 PENDING 상태 정리
    await prisma.purchase.deleteMany({
      where: {
        userId: session.user.id,
        courseId,
        status: 'PENDING',
      },
    });

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. Purchase 생성 (쿠폰 할인 정보 포함)
      const purchase = await tx.purchase.create({
        data: {
          userId: session.user.id,
          courseId,
          amount: finalAmount,
          originalAmount: discountAmount > 0 ? course.price : null,
          discountAmount: discountAmount > 0 ? discountAmount : null,
          status: 'PENDING',
        },
      });

      // 2. orderId 생성
      const orderId = `BANK_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 3. Payment 생성
      const payment = await tx.payment.create({
        data: {
          purchaseId: purchase.id,
          orderId,
          method: 'BANK_TRANSFER',
          status: 'PENDING',
        },
      });

      // 4. BankTransfer 생성
      const bankTransfer = await tx.bankTransfer.create({
        data: {
          paymentId: payment.id,
          depositorName,
          expectedDepositDate: new Date(expectedDepositDate),
          status: 'PENDING',
        },
      });

      // 5. 쿠폰 사용 예약 (실제 사용은 입금 승인 시)
      // 쿠폰 ID를 저장해두고 나중에 사용
      return { purchase, payment, bankTransfer, couponId: couponValidation?.coupon?.id };
    });

    return NextResponse.json({
      success: true,
      message: '무통장입금 요청이 완료되었습니다.',
      purchaseId: result.purchase.id,
      orderId: result.payment.orderId,
      amount: finalAmount,
      originalAmount: course.price,
      discountAmount: discountAmount,
      courseName: course.title,
      depositorName,
      couponId: result.couponId,
      bankInfo: {
        bank: '신한은행',
        accountNumber: '110-123-456789',
        accountHolder: '(주)Private LMS',
      },
    });
  } catch (error) {
    console.error('무통장입금 요청 오류:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '무통장입금 요청에 실패했습니다.' },
      { status: 500 }
    );
  }
}
