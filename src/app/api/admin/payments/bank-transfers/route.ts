import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/payments/bank-transfers - 무통장입금 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // 관리자 권한 확인
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';

    // 무통장입금 목록 조회
    const whereClause = status === 'ALL' ? {} : { status };

    const transfers = await prisma.bankTransfer.findMany({
      where: whereClause,
      include: {
        payment: {
          include: {
            purchase: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error('무통장입금 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
