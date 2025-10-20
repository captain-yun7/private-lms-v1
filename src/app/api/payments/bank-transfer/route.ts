import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 무통장입금 요청 스키마
const bankTransferSchema = z.object({
  courseId: z.string(),
  buyerName: z.string(),
  buyerEmail: z.string().email(),
  buyerPhone: z.string(),
  depositorName: z.string(),
  expectedDepositDate: z.string(), // ISO date string
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
    const { courseId, buyerName, buyerEmail, buyerPhone, depositorName, expectedDepositDate } =
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
      // 1. Purchase 생성
      const purchase = await tx.purchase.create({
        data: {
          userId: session.user.id,
          courseId,
          amount: course.price,
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

      return { purchase, payment, bankTransfer };
    });

    return NextResponse.json({
      success: true,
      message: '무통장입금 요청이 완료되었습니다.',
      purchaseId: result.purchase.id,
      orderId: result.payment.orderId,
      amount: course.price,
      courseName: course.title,
      depositorName,
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
