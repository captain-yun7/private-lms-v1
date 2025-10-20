import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 강의 생성
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
    const { title, description, price, instructorName, instructorIntro, thumbnailUrl, isPublished } = body;

    // 유효성 검사
    if (!title || !description || !price || !instructorName) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 });
    }

    const course = await prisma.course.create({
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
    console.error('강의 생성 실패:', error);
    return NextResponse.json({ error: '강의 생성 실패' }, { status: 500 });
  }
}
