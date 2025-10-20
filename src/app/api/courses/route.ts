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
      published: true, // 공개된 강의만
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    // 정렬 조건
    const orderBy: any = [];
    switch (sort) {
      case 'latest':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'popular':
        orderBy.push({ _count: { enrollments: 'desc' } });
        break;
      case 'price-low':
        orderBy.push({ price: 'asc' });
        break;
      case 'price-high':
        orderBy.push({ price: 'desc' });
        break;
      case 'rating':
        // Note: rating 필드는 스키마에 없으므로 나중에 추가 필요
        orderBy.push({ createdAt: 'desc' });
        break;
      default:
        orderBy.push({ createdAt: 'desc' });
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
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

    // 응답 데이터 포맷팅
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail: course.thumbnail,
      category: course.category,
      duration: course.duration,
      instructor: {
        id: course.instructor.id,
        name: course.instructor.name || '알 수 없음',
        image: course.instructor.image,
      },
      studentCount: course._count.enrollments,
      videoCount: course._count.videos,
      published: course.published,
      createdAt: course.createdAt,
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
