import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 영상 추가
export async function POST(
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
    const { vimeoUrl, title, description, isPreview } = body;

    // Vimeo ID 추출
    const vimeoIdMatch = vimeoUrl.match(/vimeo\.com\/(\d+)/);
    const vimeoId = vimeoIdMatch ? vimeoIdMatch[1] : null;

    // 현재 최대 순서 조회
    const maxOrder = await prisma.video.aggregate({
      where: { courseId: params.id },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order || 0) + 1;

    const video = await prisma.video.create({
      data: {
        courseId: params.id,
        vimeoUrl,
        vimeoId,
        title,
        description: description || null,
        order: nextOrder,
        isPreview: isPreview || false,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('영상 추가 실패:', error);
    return NextResponse.json({ error: '영상 추가 실패' }, { status: 500 });
  }
}
