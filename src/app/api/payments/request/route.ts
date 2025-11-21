import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { CouponService } from '@/lib/services/coupon.service';

// 결제 요청 스키마
const paymentRequestSchema = z.object({
  courseId: z.string(),
  buyerName: z.string(),
  buyerEmail: z.string().email(),
  buyerPhone: z.string(),
  couponCode: z.string().optional(), // 쿠폰 코드 (선택사항)
});

// POST /api/payments/request - 결제 요청 생성
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
    const { courseId, buyerName, buyerEmail, buyerPhone, couponCode } = paymentRequestSchema.parse(body);

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

    // 기존 PENDING 상태 모두 정리 (결제창 닫았거나 실패한 경우)
    // 새로운 결제 시도 시 이전 PENDING은 더 이상 유효하지 않음
    await prisma.purchase.deleteMany({
      where: {
        userId: session.user.id,
        courseId,
        status: 'PENDING',
      },
    });

    // Purchase 생성 (쿠폰 할인 정보 포함)
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        courseId,
        amount: finalAmount,
        originalAmount: discountAmount > 0 ? course.price : null,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        status: 'PENDING',
      },
    });

    // orderId 생성 (타임스탬프 + 랜덤)
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Payment 생성
    const payment = await prisma.payment.create({
      data: {
        purchaseId: purchase.id,
        orderId,
        method: 'CARD', // 일단 카드로 생성 (나중에 변경 가능)
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      orderId,
      amount: finalAmount,
      originalAmount: course.price,
      discountAmount: discountAmount,
      orderName: course.title,
      customerName: buyerName,
      customerEmail: buyerEmail,
      customerMobilePhone: buyerPhone,
      purchaseId: purchase.id,
      couponId: couponValidation?.coupon?.id,
    });
  } catch (error) {
    console.error('결제 요청 오류:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '결제 요청에 실패했습니다.' },
      { status: 500 }
    );
  }
}
