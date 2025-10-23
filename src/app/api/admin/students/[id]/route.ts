import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/students/[id] - 학생 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { id } = await params;

    const student = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                _count: {
                  select: {
                    videos: true,
                  },
                },
              },
            },
          },
          orderBy: {
            enrolledAt: 'desc',
          },
        },
        purchases: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
            payment: {
              select: {
                method: true,
                status: true,
                paidAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        devices: {
          select: {
            id: true,
            name: true,
            platform: true,
            lastUsedAt: true,
            createdAt: true,
          },
          orderBy: {
            lastUsedAt: 'desc',
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 각 enrollment의 진도율 정보 조회
    const enrollmentsWithProgress = await Promise.all(
      student.enrollments.map(async (enrollment) => {
        // 해당 강의의 모든 비디오에 대한 진도율 조회
        const progresses = await prisma.progress.findMany({
          where: {
            userId: id,
            video: {
              courseId: enrollment.course.id,
            },
          },
          select: {
            videoId: true,
            isCompleted: true,
          },
        });

        return {
          ...enrollment,
          progress: progresses,
        };
      })
    );

    return NextResponse.json({
      student: {
        ...student,
        enrollments: enrollmentsWithProgress,
      },
    });
  } catch (error) {
    console.error('학생 상세 조회 에러:', error);
    return NextResponse.json(
      { error: '학생 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
