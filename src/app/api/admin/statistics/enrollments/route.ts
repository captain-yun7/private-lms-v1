import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/statistics/enrollments - 수강 통계
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

    // 전체 수강 통계
    const [totalEnrollments, periodEnrollments, totalProgress, activeLearners] = await Promise.all([
      // 전체 수강 신청 수
      prisma.enrollment.count(),

      // 기간 내 수강 신청 수
      prisma.enrollment.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // 전체 진도율 (평균)
      prisma.videoProgress.groupBy({
        by: ['enrollmentId'],
        _count: {
          id: true,
        },
        where: {
          isCompleted: true,
        },
      }),

      // 활성 학습자 (기간 내 진도가 있는 사용자)
      prisma.videoProgress.groupBy({
        by: ['userId'],
        where: {
          updatedAt: { gte: startDate },
        },
        _count: { id: true },
      }),
    ]);

    // 강의별 수강생 수 및 완강률 (Top 10)
    const enrollmentsByCourse = await prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        _count: {
          select: {
            enrollments: true,
            videos: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            progress: {
              where: {
                isCompleted: true,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const courseEnrollmentData = enrollmentsByCourse.map(course => {
      const totalVideos = course._count.videos;
      const enrollmentCount = course._count.enrollments;

      // 완강한 수강생 수 계산
      const completedStudents = course.enrollments.filter(enrollment => {
        const completedVideos = enrollment.progress.length;
        return totalVideos > 0 && completedVideos >= totalVideos;
      }).length;

      const completionRate = enrollmentCount > 0 ? (completedStudents / enrollmentCount) * 100 : 0;

      return {
        course: {
          id: course.id,
          title: course.title,
          thumbnailUrl: course.thumbnailUrl,
          videoCount: totalVideos,
        },
        enrollmentCount,
        completedStudents,
        completionRate: Math.round(completionRate * 10) / 10,
      };
    });

    // 시간별 수강 신청 추이
    let timeSeriesData;

    if (groupBy === 'day') {
      // 일별 데이터
      const daysCount = Math.min(days, 90);
      timeSeriesData = await Promise.all(
        Array.from({ length: daysCount }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (daysCount - 1 - i));
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          return prisma.enrollment.count({
            where: {
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

          return prisma.enrollment.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          }).then(count => ({
            date: startDate.toISOString().split('T')[0],
            count,
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

          return prisma.enrollment.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          }).then(count => ({
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            count,
          }));
        })
      );
    }

    // 전체 완강률 계산
    const enrollmentsWithVideoCounts = await prisma.enrollment.findMany({
      select: {
        id: true,
        course: {
          select: {
            _count: {
              select: {
                videos: true,
              },
            },
          },
        },
        progress: {
          where: {
            isCompleted: true,
          },
          select: {
            id: true,
          },
        },
      },
    });

    const completedEnrollments = enrollmentsWithVideoCounts.filter(enrollment => {
      const totalVideos = enrollment.course._count.videos;
      const completedVideos = enrollment.progress.length;
      return totalVideos > 0 && completedVideos >= totalVideos;
    }).length;

    const overallCompletionRate = totalEnrollments > 0
      ? (completedEnrollments / totalEnrollments) * 100
      : 0;

    return NextResponse.json({
      summary: {
        total: {
          enrollments: totalEnrollments,
          completedEnrollments,
          completionRate: Math.round(overallCompletionRate * 10) / 10,
        },
        period: {
          enrollments: periodEnrollments,
          activeLearners: activeLearners.length,
        },
      },
      byCourse: courseEnrollmentData,
      timeSeries: timeSeriesData,
    });
  } catch (error) {
    console.error('수강 통계 조회 에러:', error);
    return NextResponse.json(
      { error: '수강 통계를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
