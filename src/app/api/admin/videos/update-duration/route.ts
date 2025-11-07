import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Vimeo } from '@vimeo/vimeo';

// 모든 영상의 duration 업데이트 (기존 영상용)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // Vimeo 토큰 확인
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    if (!vimeoToken || vimeoToken === 'your-vimeo-access-token') {
      return NextResponse.json(
        { error: 'Vimeo API 토큰이 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    // duration이 null인 모든 영상 조회
    const videos = await prisma.video.findMany({
      where: {
        OR: [
          { duration: null },
          { duration: 0 },
        ],
      },
    });

    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        message: '업데이트할 영상이 없습니다',
        updated: 0,
      });
    }

    const client = new Vimeo(null, null, vimeoToken);
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // 각 영상의 duration 업데이트
    for (const video of videos) {
      if (!video.vimeoId) {
        failCount++;
        errors.push(`${video.title}: Vimeo ID가 없습니다`);
        continue;
      }

      try {
        // Vimeo API로 영상 정보 가져오기
        const videoInfo = await new Promise<any>((resolve, reject) => {
          client.request(
            {
              method: 'GET',
              path: `/videos/${video.vimeoId}`,
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

        const duration = videoInfo.duration || null;

        if (duration) {
          // DB 업데이트
          await prisma.video.update({
            where: { id: video.id },
            data: { duration },
          });

          successCount++;
          console.log(`✓ ${video.title}: ${duration}초 업데이트 완료`);
        } else {
          failCount++;
          errors.push(`${video.title}: duration 정보를 가져올 수 없습니다`);
        }
      } catch (error: any) {
        failCount++;
        errors.push(`${video.title}: ${error.message}`);
        console.error(`✗ ${video.title} 업데이트 실패:`, error);
      }

      // Vimeo API rate limit 방지를 위해 짧은 지연
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      totalVideos: videos.length,
      successCount,
      failCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Duration 업데이트 실패:', error);
    return NextResponse.json(
      { error: 'Duration 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
