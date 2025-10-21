import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/dashboard - 대시보드 통계
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // 기본 30일
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 병렬로 모든 통계 데이터 가져오기
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      newUsersCount,
      newEnrollmentsCount,
      periodRevenue,
      completedPaymentsCount,
      pendingPaymentsCount,
      courseStats,
      recentEnrollments,
      recentPayments,
      userGrowth,
      revenueByDay,
    ] = await Promise.all([
      // 전체 사용자 수
      prisma.user.count({
        where: { role: 'STUDENT' },
      }),

      // 전체 강의 수
      prisma.course.count({
        where: { isPublished: true },
      }),

      // 전체 수강 신청 수
      prisma.enrollment.count(),

      // 전체 수익
      prisma.purchase.aggregate({
        where: {
          payment: {
            status: 'COMPLETED'
          }
        },
        _sum: { amount: true },
      }),

      // 기간 내 신규 사용자
      prisma.user.count({
        where: {
          role: 'STUDENT',
          createdAt: { gte: startDate },
        },
      }),

      // 기간 내 신규 수강 신청
      prisma.enrollment.count({
        where: {
          enrolledAt: { gte: startDate },
        },
      }),

      // 기간 내 수익
      prisma.purchase.aggregate({
        where: {
          payment: {
            status: 'COMPLETED',
            paidAt: { gte: startDate },
          }
        },
        _sum: { amount: true },
      }),

      // 완료된 결제 건수
      prisma.payment.count({
        where: { status: 'COMPLETED' },
      }),

      // 대기 중인 결제 건수 (무통장입금)
      prisma.payment.count({
        where: { status: 'PENDING' },
      }),

      // 강의별 통계 (Top 5)
      prisma.course.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          price: true,
          _count: {
            select: {
              enrollments: true,
              purchases: true,
            },
          },
        },
        orderBy: {
          enrollments: {
            _count: 'desc',
          },
        },
        take: 5,
      }),

      // 최근 수강 신청 (5개)
      prisma.enrollment.findMany({
        select: {
          id: true,
          enrolledAt: true,
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
        orderBy: {
          enrolledAt: 'desc',
        },
        take: 5,
      }),

      // 최근 결제 (5개)
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
        },
        select: {
          id: true,
          orderId: true,
          method: true,
          paidAt: true,
          purchase: {
            select: {
              amount: true,
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
          paidAt: 'desc',
        },
        take: 5,
      }),

      // 사용자 증가 추이 (최근 7일)
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          return prisma.user.count({
            where: {
              role: 'STUDENT',
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          }).then(count => ({
            date: date.toISOString().split('T')[0],
            count,
          }));
        })
      ),

      // 수익 추이 (최근 7일)
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          return prisma.purchase.aggregate({
            where: {
              payment: {
                status: 'COMPLETED',
                paidAt: {
                  gte: date,
                  lt: nextDate,
                },
              }
            },
            _sum: { amount: true },
          }).then(result => ({
            date: date.toISOString().split('T')[0],
            amount: result._sum.amount || 0,
          }));
        })
      ),
    ]);

    // 강의별 수익 계산
    const courseStatsWithRevenue = await Promise.all(
      courseStats.map(async (course) => {
        const revenue = await prisma.purchase.aggregate({
          where: {
            courseId: course.id,
            payment: {
              status: 'COMPLETED',
            },
          },
          _sum: { amount: true },
        });

        return {
          ...course,
          revenue: revenue._sum.amount || 0,
        };
      })
    );

    return NextResponse.json({
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.amount || 0,
        newUsers: newUsersCount,
        newEnrollments: newEnrollmentsCount,
        periodRevenue: periodRevenue._sum.amount || 0,
        completedPayments: completedPaymentsCount,
        pendingPayments: pendingPaymentsCount,
      },
      courseStats: courseStatsWithRevenue,
      recentEnrollments,
      recentPayments,
      charts: {
        userGrowth,
        revenueByDay,
      },
    });
  } catch (error) {
    console.error('대시보드 데이터 조회 에러:', error);
    return NextResponse.json(
      { error: '대시보드 데이터를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
