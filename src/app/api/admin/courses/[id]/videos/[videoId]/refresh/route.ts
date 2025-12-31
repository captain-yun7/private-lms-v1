import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getVideoInfo } from '@/lib/vdocipher';

// 영상 정보 새로고침 (Vimeo/VdoCipher에서 최신 정보 가져오기)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { videoId } = await params;

    // 현재 영상 정보 조회
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json({ error: '영상을 찾을 수 없습니다' }, { status: 404 });
    }

    // VdoCipher 영상인 경우
    if (video.vdoCipherId) {
      try {
        const vdoInfo = await getVideoInfo(video.vdoCipherId);

        const updatedVideo = await prisma.video.update({
          where: { id: videoId },
          data: {
            duration: vdoInfo.length ? Math.round(vdoInfo.length) : video.duration,
          },
        });

        return NextResponse.json({
          success: true,
          video: updatedVideo,
          status: vdoInfo.status || 'unknown',
        });
      } catch (error) {
        console.error('VdoCipher 영상 정보 조회 실패:', error);
        return NextResponse.json({ error: 'VdoCipher에서 영상 정보를 가져올 수 없습니다' }, { status: 500 });
      }
    }

    // Vimeo 영상인 경우
    if (video.vimeoId) {
      const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
      if (!vimeoToken) {
        return NextResponse.json({ error: 'Vimeo 토큰이 설정되지 않았습니다' }, { status: 500 });
      }

      const vimeoResponse = await fetch(`https://api.vimeo.com/videos/${video.vimeoId}`, {
        headers: {
          'Authorization': `Bearer ${vimeoToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      if (!vimeoResponse.ok) {
        return NextResponse.json({ error: 'Vimeo에서 영상 정보를 가져올 수 없습니다' }, { status: 500 });
      }

      const videoInfo = await vimeoResponse.json();

      const updatedVideo = await prisma.video.update({
        where: { id: videoId },
        data: {
          duration: videoInfo.duration || video.duration,
          vimeoUrl: videoInfo.link || video.vimeoUrl,
        },
      });

      return NextResponse.json({
        success: true,
        video: updatedVideo,
        status: videoInfo.transcode?.status || videoInfo.status || 'unknown',
      });
    }

    return NextResponse.json({ error: '영상 ID가 없습니다 (Vimeo/VdoCipher)' }, { status: 400 });
  } catch (error: any) {
    console.error('영상 정보 새로고침 실패:', error);
    return NextResponse.json({ error: error.message || '영상 정보 새로고침 실패' }, { status: 500 });
  }
}
