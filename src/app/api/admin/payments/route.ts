import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/payments - 전체 결제 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method'); // CARD, BANK_TRANSFER
    const status = searchParams.get('status'); // COMPLETED, PENDING, CANCELED, REFUNDED
    const search = searchParams.get('search'); // 사용자 이름/이메일 검색
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};

    if (method) {
      where.method = method;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.purchase = {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    // 통계 데이터 - Purchase 기준으로 계산
    const purchaseWhere: any = {};
    if (method || status) {
      purchaseWhere.payment = {};
      if (method) purchaseWhere.payment.method = method;
      if (status) purchaseWhere.payment.status = status;
    }
    if (startDate || endDate) {
      if (!purchaseWhere.payment) purchaseWhere.payment = {};
      purchaseWhere.payment.createdAt = {};
      if (startDate) purchaseWhere.payment.createdAt.gte = new Date(startDate);
      if (endDate) purchaseWhere.payment.createdAt.lte = new Date(endDate);
    }
    if (search) {
      purchaseWhere.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      };
    }

    const stats = await prisma.purchase.aggregate({
      where: purchaseWhere,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // 상태별 통계 - Payment를 조회하고 Purchase에서 amount 가져오기
    const allPaymentsForStats = await prisma.payment.findMany({
      where: method ? { method } : {},
      select: {
        status: true,
        purchase: {
          select: {
            amount: true,
          },
        },
      },
    });

    const statusStats = allPaymentsForStats.reduce((acc, payment) => {
      if (!acc[payment.status]) {
        acc[payment.status] = { count: 0, amount: 0 };
      }
      acc[payment.status].count++;
      acc[payment.status].amount += payment.purchase.amount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalCount: stats._count.id,
        byStatus: statusStats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count.id,
            amount: stat._sum.amount || 0,
          };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
      },
    });
  } catch (error) {
    console.error('결제 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '결제 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
