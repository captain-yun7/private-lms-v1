import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/payments/bank-transfers/[id]/approve - 무통장입금 승인
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // 관리자 권한 확인
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // BankTransfer 조회
    const bankTransfer = await prisma.bankTransfer.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            purchase: {
              include: {
                user: true,
                course: true,
              },
            },
          },
        },
      },
    });

    if (!bankTransfer) {
      return NextResponse.json(
        { error: '무통장입금 내역을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 승인되었는지 확인
    if (bankTransfer.status === 'APPROVED') {
      return NextResponse.json(
        { error: '이미 승인된 입금입니다.' },
        { status: 400 }
      );
    }

    // 이미 거절되었는지 확인
    if (bankTransfer.status === 'REJECTED') {
      return NextResponse.json(
        { error: '거절된 입금은 승인할 수 없습니다.' },
        { status: 400 }
      );
    }

    const { payment } = bankTransfer;
    const { purchase } = payment;

    // 트랜잭션으로 승인 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. BankTransfer 상태 업데이트
      await tx.bankTransfer.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.user.id,
        },
      });

      // 2. Payment 상태 업데이트
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      // 3. Purchase 상태 업데이트
      await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'COMPLETED',
        },
      });

      // 4. 이미 Enrollment가 있는지 확인 (중복 방지)
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: purchase.userId,
            courseId: purchase.courseId,
          },
        },
      });

      let enrollment;
      if (existingEnrollment) {
        enrollment = existingEnrollment;
      } else {
        // 5. Enrollment 생성 (수강 등록)
        enrollment = await tx.enrollment.create({
          data: {
            userId: purchase.userId,
            courseId: purchase.courseId,
          },
        });
      }

      // 6. Receipt 생성 (영수증)
      const receipt = await tx.receipt.create({
        data: {
          purchaseId: purchase.id,
          receiptNumber: `R${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          amount: purchase.amount,
          issuedAt: new Date(),
        },
      });

      return { enrollment, receipt };
    });

    // TODO: 이메일 알림 발송 (optional)
    // await sendEmail({
    //   to: purchase.user.email,
    //   subject: '입금이 확인되었습니다',
    //   body: `${purchase.course.title} 강의의 입금이 확인되어 수강이 가능합니다.`,
    // });

    return NextResponse.json({
      success: true,
      message: '승인되었습니다.',
      enrollment: result.enrollment,
    });
  } catch (error) {
    console.error('무통장입금 승인 오류:', error);
    return NextResponse.json(
      { error: '승인 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
}
