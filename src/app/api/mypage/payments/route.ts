import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/mypage/payments - 내 결제 내역 조회
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 내 결제 내역 조회
    const payments = await prisma.payment.findMany({
      where: {
        purchase: {
          userId: session.user.id,
        },
      },
      include: {
        purchase: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
              },
            },
          },
        },
        bankTransfer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('결제 내역 조회 오류:', error);
    return NextResponse.json(
      { error: '결제 내역을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
