import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/statistics/revenue - 수익 통계
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // 기본 30일
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 전체 수익 통계
    const [totalRevenue, periodRevenue, revenueByMethod, revenueByStatus] = await Promise.all([
      // 전체 수익
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // 기간 내 수익
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paidAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // 결제 수단별 수익
      prisma.payment.groupBy({
        by: ['method'],
        where: {
          status: 'COMPLETED',
          paidAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // 상태별 결제 건수
      prisma.payment.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    // 강의별 수익 (Top 10)
    const revenueByCourse = await prisma.payment.groupBy({
      by: ['purchaseId'],
      where: {
        status: 'COMPLETED',
        paidAt: { gte: startDate },
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 10,
    });

    // 강의 정보 가져오기
    const purchaseIds = revenueByCourse.map(r => r.purchaseId);
    const purchases = await prisma.purchase.findMany({
      where: { id: { in: purchaseIds } },
      select: {
        id: true,
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    const courseRevenueData = revenueByCourse.map(r => {
      const purchase = purchases.find(p => p.id === r.purchaseId);
      return {
        course: purchase?.course,
        revenue: r._sum.amount || 0,
        count: r._count.id,
      };
    });

    // 시간별 수익 추이
    let timeSeriesData;

    if (groupBy === 'day') {
      // 일별 데이터
      const daysCount = Math.min(days, 90); // 최대 90일
      timeSeriesData = await Promise.all(
        Array.from({ length: daysCount }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (daysCount - 1 - i));
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          return prisma.payment.aggregate({
            where: {
              status: 'COMPLETED',
              paidAt: {
                gte: date,
                lt: nextDate,
              },
            },
            _sum: { amount: true },
            _count: { id: true },
          }).then(result => ({
            date: date.toISOString().split('T')[0],
            amount: result._sum.amount || 0,
            count: result._count.id,
          }));
        })
      );
    } else if (groupBy === 'week') {
      // 주별 데이터 (최근 12주)
      const weeksCount = 12;
      timeSeriesData = await Promise.all(
        Array.from({ length: weeksCount }, (_, i) => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - (i * 7));
          endDate.setHours(23, 59, 59, 999);
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);

          return prisma.payment.aggregate({
            where: {
              status: 'COMPLETED',
              paidAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: { amount: true },
            _count: { id: true },
          }).then(result => ({
            date: startDate.toISOString().split('T')[0],
            amount: result._sum.amount || 0,
            count: result._count.id,
          }));
        })
      ).then(data => data.reverse());
    } else {
      // 월별 데이터 (최근 12개월)
      const monthsCount = 12;
      timeSeriesData = await Promise.all(
        Array.from({ length: monthsCount }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (monthsCount - 1 - i));
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setMonth(nextDate.getMonth() + 1);

          return prisma.payment.aggregate({
            where: {
              status: 'COMPLETED',
              paidAt: {
                gte: date,
                lt: nextDate,
              },
            },
            _sum: { amount: true },
            _count: { id: true },
          }).then(result => ({
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            amount: result._sum.amount || 0,
            count: result._count.id,
          }));
        })
      );
    }

    return NextResponse.json({
      summary: {
        total: {
          revenue: totalRevenue._sum.amount || 0,
          count: totalRevenue._count.id,
        },
        period: {
          revenue: periodRevenue._sum.amount || 0,
          count: periodRevenue._count.id,
        },
      },
      byMethod: revenueByMethod.map(m => ({
        method: m.method,
        revenue: m._sum.amount || 0,
        count: m._count.id,
      })),
      byStatus: revenueByStatus.map(s => ({
        status: s.status,
        revenue: s._sum.amount || 0,
        count: s._count.id,
      })),
      byCourse: courseRevenueData,
      timeSeries: timeSeriesData,
    });
  } catch (error) {
    console.error('수익 통계 조회 에러:', error);
    return NextResponse.json(
      { error: '수익 통계를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
