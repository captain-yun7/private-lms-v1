import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// POST /api/inquiries - 문의 작성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();

    // 유효성 검사
    const schema = z.object({
      title: z.string().min(1, '제목을 입력해주세요').max(200),
      content: z.string().min(10, '내용을 10자 이상 입력해주세요'),
      isPrivate: z.boolean().default(false),
    });

    const { title, content, isPrivate } = schema.parse(body);

    // 문의 생성
    const inquiry = await prisma.inquiry.create({
      data: {
        title,
        content,
        isPrivate,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        isPrivate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('문의 작성 에러:', error);
    return NextResponse.json(
      { error: '문의 작성에 실패했습니다' },
      { status: 500 }
    );
  }
}

// GET /api/inquiries - 내 문의 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 내 문의 목록 조회
    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
          isPrivate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.inquiry.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('문의 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '문의 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
