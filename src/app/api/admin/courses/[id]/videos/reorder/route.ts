import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/courses/[id]/videos/reorder - 영상 순서 일괄 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { videoIds } = await request.json();

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ error: '영상 ID 배열이 필요합니다' }, { status: 400 });
    }

    // 트랜잭션으로 순서 일괄 업데이트
    await prisma.$transaction(
      videoIds.map((videoId, index) =>
        prisma.video.update({
          where: { id: videoId },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering videos:', error);
    return NextResponse.json(
      { error: '순서 변경 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
