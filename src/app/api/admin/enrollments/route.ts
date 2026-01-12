import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 수강권 부여
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json({ error: '사용자 ID와 강의 ID가 필요합니다' }, { status: 400 });
    }

    // 이미 수강 중인지 확인
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: '이미 수강 중인 강의입니다' }, { status: 400 });
    }

    // 강의 정보 조회 (수강 기간 확인)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { enrollmentDuration: true, title: true },
    });

    if (!course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });
    }

    // 수강권 부여
    // 수강 만료일: 강의 설정에 따름 (null이면 무제한)
    let expiresAt: Date | null = null;
    if (course.enrollmentDuration) {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + course.enrollmentDuration);
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        expiresAt,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${enrollment.course.title} 수강권이 부여되었습니다`,
      enrollment,
    });
  } catch (error) {
    console.error('수강권 부여 실패:', error);
    return NextResponse.json({ error: '수강권 부여에 실패했습니다' }, { status: 500 });
  }
}

// 수강권 취소
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('id');

    if (!enrollmentId) {
      return NextResponse.json({ error: '수강 ID가 필요합니다' }, { status: 400 });
    }

    // 수강권 삭제
    await prisma.enrollment.delete({
      where: {
        id: enrollmentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: '수강권이 취소되었습니다',
    });
  } catch (error) {
    console.error('수강권 취소 실패:', error);
    return NextResponse.json({ error: '수강권 취소에 실패했습니다' }, { status: 500 });
  }
}
