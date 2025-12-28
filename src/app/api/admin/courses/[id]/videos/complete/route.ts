import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 최대 실행 시간 설정
export const maxDuration = 60;

// Vimeo 영상 정보를 가져오는 함수 (재시도 포함)
async function getVimeoVideoInfo(vimeoId: string, vimeoToken: string, maxRetries = 5): Promise<{ duration: number | null; link: string }> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`https://api.vimeo.com/videos/${vimeoId}`, {
        headers: {
          'Authorization': `Bearer ${vimeoToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      if (!response.ok) {
        throw new Error(`Vimeo API 오류: ${response.status}`);
      }

      const videoInfo = await response.json();

      // 영상 상태 확인
      const status = videoInfo.transcode?.status || videoInfo.status;
      console.log(`[Vimeo] 영상 상태 (시도 ${i + 1}/${maxRetries}):`, status);
      console.log('[Vimeo] 영상 정보:', {
        duration: videoInfo.duration,
        link: videoInfo.link,
        status: status,
      });

      // link는 항상 존재해야 함 (privacy hash 포함)
      const link = videoInfo.link || `https://vimeo.com/${vimeoId}`;

      // duration이 있으면 바로 반환
      if (videoInfo.duration && videoInfo.duration > 0) {
        return {
          duration: videoInfo.duration,
          link: link,
        };
      }

      // duration이 없으면 (아직 처리 중) 잠시 대기 후 재시도
      if (i < maxRetries - 1) {
        console.log(`[Vimeo] 영상 처리 중, ${3}초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`[Vimeo] 정보 가져오기 실패 (시도 ${i + 1}/${maxRetries}):`, error);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // 최대 재시도 후에도 실패하면 기본값 반환
  console.warn('[Vimeo] 영상 정보 가져오기 최종 실패, 기본값 사용');
  return {
    duration: null,
    link: `https://vimeo.com/${vimeoId}`,
  };
}

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

    // Vimeo API로 영상 정보 가져오기 (재시도 포함)
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    let duration: number | null = null;
    let vimeoUrl = `https://vimeo.com/${vimeoId}`;

    if (vimeoToken) {
      const videoInfo = await getVimeoVideoInfo(vimeoId, vimeoToken);
      duration = videoInfo.duration;
      vimeoUrl = videoInfo.link;

      console.log('[Complete] 최종 영상 정보:', { duration, vimeoUrl });
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
      message: duration ? '영상이 저장되었습니다.' : '영상이 저장되었습니다. (처리 중이므로 재생 시간은 나중에 업데이트됩니다)',
    });
  } catch (error: any) {
    console.error('영상 정보 저장 실패:', error);
    return NextResponse.json(
      { error: error.message || '영상 정보 저장 실패' },
      { status: 500 }
    );
  }
}
