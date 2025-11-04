import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/courses - 강의 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'latest';

    // 검색 및 필터 조건
    const where: any = {
      isPublished: true, // 공개된 강의만
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 정렬 조건 (최신순으로 고정)
    const orderBy: any = [{ createdAt: 'desc' }];

    const courses = await prisma.course.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            enrollments: true,
            videos: true,
          },
        },
      },
    });

    // 응답 데이터 포맷팅
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnailUrl: course.thumbnailUrl,
      instructorName: course.instructorName,
      instructorIntro: course.instructorIntro,
      studentCount: course._count.enrollments,
      videoCount: course._count.videos,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json({
      courses: formattedCourses,
      total: formattedCourses.length,
    });
  } catch (error) {
    console.error('강의 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '강의 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
