import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/inquiries/[id] - 문의 상세 조회 (관리자)
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          select: {
            id: true,
            content: true,
            createdAt: true,
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

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error('문의 조회 에러:', error);
    return NextResponse.json(
      { error: '문의를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
