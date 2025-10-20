import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 강의 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        videos: {
          orderBy: { order: 'asc' },
        },
        courseFiles: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // courseFiles를 files로 변환 (클라이언트 인터페이스와 일치시키기 위해)
    if (course) {
      const { courseFiles, ...rest } = course;
      return NextResponse.json({
        ...rest,
        files: courseFiles,
      });
    }

    return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });
  } catch (error) {
    console.error('강의 조회 실패:', error);
    return NextResponse.json({ error: '강의 조회 실패' }, { status: 500 });
  }
}

// 강의 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, instructorName, instructorIntro, thumbnailUrl, isPublished } = body;

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        title,
        description,
        price: parseInt(price),
        instructorName,
        instructorIntro: instructorIntro || null,
        thumbnailUrl: thumbnailUrl || null,
        isPublished: isPublished || false,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('강의 수정 실패:', error);
    return NextResponse.json({ error: '강의 수정 실패' }, { status: 500 });
  }
}

// 강의 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('강의 삭제 실패:', error);
    return NextResponse.json({ error: '강의 삭제 실패' }, { status: 500 });
  }
}
