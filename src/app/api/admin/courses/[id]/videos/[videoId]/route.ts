import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 영상 삭제
export async function DELETE(
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

    // 영상 삭제
    const deletedVideo = await prisma.video.delete({
      where: { id: params.videoId },
    });

    // 순서 재정렬
    const videos = await prisma.video.findMany({
      where: { courseId: params.id },
      orderBy: { order: 'asc' },
    });

    // 순서 업데이트
    await Promise.all(
      videos.map((video, index) =>
        prisma.video.update({
          where: { id: video.id },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('영상 삭제 실패:', error);
    return NextResponse.json({ error: '영상 삭제 실패' }, { status: 500 });
  }
}
