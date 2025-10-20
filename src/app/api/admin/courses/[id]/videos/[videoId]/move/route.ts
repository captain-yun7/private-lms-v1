import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 영상 순서 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
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
    const { direction } = body; // 'up' or 'down'

    // 현재 영상 조회
    const currentVideo = await prisma.video.findUnique({
      where: { id: params.videoId },
    });

    if (!currentVideo) {
      return NextResponse.json({ error: '영상을 찾을 수 없습니다' }, { status: 404 });
    }

    // 교체할 영상 찾기
    const targetVideo = await prisma.video.findFirst({
      where: {
        courseId: params.id,
        order: direction === 'up' ? currentVideo.order - 1 : currentVideo.order + 1,
      },
    });

    if (!targetVideo) {
      return NextResponse.json({ error: '이동할 수 없습니다' }, { status: 400 });
    }

    // 순서 교체
    await prisma.$transaction([
      prisma.video.update({
        where: { id: currentVideo.id },
        data: { order: targetVideo.order },
      }),
      prisma.video.update({
        where: { id: targetVideo.id },
        data: { order: currentVideo.order },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('순서 변경 실패:', error);
    return NextResponse.json({ error: '순서 변경 실패' }, { status: 500 });
  }
}
