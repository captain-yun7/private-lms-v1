import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 결제 승인 스키마
const confirmSchema = z.object({
  paymentKey: z.string(),
  orderId: z.string(),
  amount: z.number(),
});

// POST /api/payments/confirm - 결제 승인
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
    const { paymentKey, orderId, amount } = confirmSchema.parse(body);

    // Payment 찾기
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        purchase: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 금액 검증
    if (payment.purchase.amount !== amount) {
      return NextResponse.json(
        { error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 토스페이먼츠 API로 결제 승인
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: '결제 설정이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      console.error('토스페이먼츠 승인 실패:', errorData);
      return NextResponse.json(
        { error: errorData.message || '결제 승인에 실패했습니다.' },
        { status: tossResponse.status }
      );
    }

    const tossData = await tossResponse.json();

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. Payment 업데이트
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentKey,
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      // 2. Purchase 업데이트
      await tx.purchase.update({
        where: { id: payment.purchaseId },
        data: {
          status: 'COMPLETED',
        },
      });

      // 3. Enrollment 생성 (수강 등록)
      const enrollment = await tx.enrollment.create({
        data: {
          userId: session.user.id,
          courseId: payment.purchase.courseId,
        },
      });

      // 4. Receipt 생성 (영수증)
      const receiptNumber = `R${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await tx.receipt.create({
        data: {
          purchaseId: payment.purchaseId,
          receiptNumber,
        },
      });

      return { enrollment };
    });

    return NextResponse.json({
      success: true,
      message: '결제가 완료되었습니다.',
      courseId: payment.purchase.courseId,
      courseName: payment.purchase.course.title,
    });
  } catch (error) {
    console.error('결제 승인 오류:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '결제 승인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
