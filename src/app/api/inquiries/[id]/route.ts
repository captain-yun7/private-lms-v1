import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// GET /api/inquiries/[id] - 문의 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { id } = await params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        isPrivate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        replies: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            adminId: true,
            admin: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 본인의 문의만 조회 가능
    if (inquiry.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error('문의 조회 에러:', error);
    return NextResponse.json(
      { error: '문의를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// PATCH /api/inquiries/[id] - 문의 수정 (답변 전에만 가능)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 기존 문의 확인
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!existingInquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 본인의 문의만 수정 가능
    if (existingInquiry.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // 답변이 달린 문의는 수정 불가
    if (existingInquiry.status === 'ANSWERED') {
      return NextResponse.json(
        { error: '답변이 완료된 문의는 수정할 수 없습니다' },
        { status: 400 }
      );
    }

    // 유효성 검사
    const schema = z.object({
      title: z.string().min(1).max(200).optional(),
      content: z.string().min(10).optional(),
      isPrivate: z.boolean().optional(),
    });

    const data = schema.parse(body);

    // 문의 수정
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data,
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

    return NextResponse.json({ inquiry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('문의 수정 에러:', error);
    return NextResponse.json(
      { error: '문의 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE /api/inquiries/[id] - 문의 삭제 (답변 전에만 가능)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { id } = await params;

    // 기존 문의 확인
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!existingInquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 본인의 문의만 삭제 가능
    if (existingInquiry.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // 답변이 달린 문의는 삭제 불가
    if (existingInquiry.status === 'ANSWERED') {
      return NextResponse.json(
        { error: '답변이 완료된 문의는 삭제할 수 없습니다' },
        { status: 400 }
      );
    }

    // 문의 삭제
    await prisma.inquiry.delete({
      where: { id },
    });

    return NextResponse.json({ message: '문의가 삭제되었습니다' });
  } catch (error) {
    console.error('문의 삭제 에러:', error);
    return NextResponse.json(
      { error: '문의 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
