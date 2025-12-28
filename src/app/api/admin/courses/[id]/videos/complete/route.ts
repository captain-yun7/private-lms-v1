import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 2단계: 업로드 완료 후 DB 저장
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { vimeoId, title, description, isPreview } = body;

    if (!vimeoId || !title) {
      return NextResponse.json({ error: 'Vimeo ID와 제목이 필요합니다' }, { status: 400 });
    }

    const { id: courseId } = await params;

    // Vimeo API로 영상 정보 가져오기
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    let duration = null;
    let vimeoUrl = `https://vimeo.com/${vimeoId}`;

    try {
      const vimeoResponse = await fetch(`https://api.vimeo.com/videos/${vimeoId}`, {
        headers: {
          'Authorization': `Bearer ${vimeoToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      if (vimeoResponse.ok) {
        const videoInfo = await vimeoResponse.json();
        duration = videoInfo.duration || null;
        if (videoInfo.link) {
          vimeoUrl = videoInfo.link;
        }
      }
    } catch (error) {
      console.warn('Vimeo API에서 영상 정보 가져오기 실패:', error);
    }

    // 현재 최대 순서 조회
    const maxOrder = await prisma.video.aggregate({
      where: { courseId },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order || 0) + 1;

    // DB에 영상 정보 저장
    const video = await prisma.video.create({
      data: {
        courseId,
        vimeoUrl,
        vimeoId,
        title,
        description: description || null,
        duration,
        order: nextOrder,
        isPreview: isPreview || false,
      },
    });

    return NextResponse.json({
      success: true,
      video,
      vimeoUrl,
    });
  } catch (error: any) {
    console.error('영상 정보 저장 실패:', error);
    return NextResponse.json(
      { error: error.message || '영상 정보 저장 실패' },
      { status: 500 }
    );
  }
}
