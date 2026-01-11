import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/courses/[id] - 강의 상세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        videos: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            vimeoUrl: true,
            vimeoId: true,
            vdoCipherId: true,
            duration: true,
            order: true,
            isPreview: true,
          },
        },
        courseFiles: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            videos: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 미공개 강의는 관리자만 접근 가능
    if (!course.isPublished) {
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    // 수강 여부 확인 (만료일 포함)
    let isEnrolled = false;
    let isExpired = false;
    let enrolledAt: Date | null = null;
    let expiresAt: Date | null = null;
    if (session?.user?.id) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: session.user.id,
          courseId: id,
        },
      });
      if (enrollment) {
        isEnrolled = true;
        enrolledAt = enrollment.enrolledAt;
        expiresAt = enrollment.expiresAt;
        // 만료일이 있고 현재 시간보다 이전이면 만료
        if (enrollment.expiresAt && new Date() > enrollment.expiresAt) {
          isExpired = true;
        }
      }
    }

    // 총 강의 시간 계산
    const totalDuration = course.videos.reduce(
      (sum, video) => sum + (video.duration || 0),
      0
    );

    // 응답 데이터 포맷팅
    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnailUrl: course.thumbnailUrl,
      instructorName: course.instructorName,
      instructorIntro: course.instructorIntro,
      isPublished: course.isPublished,
      videos: course.videos,
      files: course.courseFiles,
      studentCount: course._count.enrollments,
      videoCount: course._count.videos,
      totalDuration, // 초 단위
      isEnrolled,
      isExpired,
      enrolledAt,
      expiresAt,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error('강의 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '강의 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
