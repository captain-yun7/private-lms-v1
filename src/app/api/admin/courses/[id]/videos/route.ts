import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Vimeo } from '@vimeo/vimeo';

// 영상 추가
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

    const { id } = await params;
    const body = await request.json();
    const { vimeoUrl, title, description, isPreview } = body;

    // Vimeo ID 추출
    const vimeoIdMatch = vimeoUrl.match(/vimeo\.com\/(\d+)/);
    const vimeoId = vimeoIdMatch ? vimeoIdMatch[1] : null;

    if (!vimeoId) {
      return NextResponse.json({ error: '유효한 Vimeo URL이 아닙니다' }, { status: 400 });
    }

    // Vimeo API로 영상 정보 가져오기 (duration 및 올바른 URL)
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    let duration = null;
    let correctVimeoUrl = vimeoUrl; // 기본값은 사용자가 입력한 URL

    if (vimeoToken && vimeoToken !== 'your-vimeo-access-token') {
      try {
        const client = new Vimeo(null, null, vimeoToken);

        const videoInfo = await new Promise<any>((resolve, reject) => {
          client.request(
            {
              method: 'GET',
              path: `/videos/${vimeoId}`,
            },
            (error: any, body: any) => {
              if (error) {
                reject(error);
              } else {
                resolve(body);
              }
            }
          );
        });

        duration = videoInfo.duration || null;

        // Privacy hash가 포함된 올바른 URL 사용 (unlisted 영상용)
        if (videoInfo.link) {
          correctVimeoUrl = videoInfo.link;
        }
      } catch (error) {
        console.warn('Vimeo API에서 영상 정보 가져오기 실패:', error);
        // 정보를 가져오지 못해도 영상 추가는 계속 진행
      }
    }

    // 현재 최대 순서 조회
    const maxOrder = await prisma.video.aggregate({
      where: { courseId: id },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order || 0) + 1;

    const video = await prisma.video.create({
      data: {
        courseId: id,
        vimeoUrl: correctVimeoUrl,
        vimeoId,
        title,
        description: description || null,
        duration,
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
