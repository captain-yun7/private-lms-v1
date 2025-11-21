import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CouponService } from '@/lib/services/coupon.service';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, courseId } = body;

    if (!code || !courseId) {
      return NextResponse.json(
        { error: '쿠폰 코드와 강의 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 강의 정보 조회
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 쿠폰 검증
    const result = await CouponService.validateCoupon(
      code,
      courseId,
      session.user.id,
      course.price
    );

    if (!result.isValid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: result.coupon?.code,
        description: result.coupon?.description,
        discountType: result.discountType,
        discountValue: result.discountValue,
        originalAmount: course.price,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount
      }
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: '쿠폰 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}