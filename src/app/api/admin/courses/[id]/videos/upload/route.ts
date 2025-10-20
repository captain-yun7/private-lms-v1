import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Vimeo } from '@vimeo/vimeo';

// Vimeo 업로드
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

    // Vimeo 토큰 확인
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    if (!vimeoToken || vimeoToken === 'your-vimeo-access-token') {
      return NextResponse.json(
        { error: 'Vimeo API 토큰이 설정되지 않았습니다. .env 파일에 VIMEO_ACCESS_TOKEN을 설정해주세요.' },
        { status: 500 }
      );
    }

    // FormData에서 파일 및 정보 추출
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPreview = formData.get('isPreview') === 'true';

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: '제목이 필요합니다' }, { status: 400 });
    }

    // Vimeo 클라이언트 생성
    const client = new Vimeo(null, null, vimeoToken);

    // 파일을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Vimeo에 업로드
    const vimeoResponse = await new Promise<any>((resolve, reject) => {
      client.upload(
        buffer,
        {
          name: title,
          description: description || '',
          privacy: {
            view: 'unlisted', // 비공개 (링크로만 접근 가능)
          },
        },
        (uri: string) => {
          // 업로드 완료
          resolve({ uri });
        },
        (bytesUploaded: number, bytesTotal: number) => {
          // 진행률 (추후 WebSocket으로 전달 가능)
          const percent = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`Upload progress: ${percent}%`);
        },
        (error: any) => {
          reject(error);
        }
      );
    });

    // Vimeo URI에서 ID 추출 (예: /videos/123456789)
    const vimeoId = vimeoResponse.uri.split('/').pop();
    const vimeoUrl = `https://vimeo.com/${vimeoId}`;

    // 현재 최대 순서 조회
    const maxOrder = await prisma.video.aggregate({
      where: { courseId: params.id },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order || 0) + 1;

    // DB에 영상 정보 저장
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

    return NextResponse.json({
      success: true,
      video,
      vimeoUrl,
    });
  } catch (error: any) {
    console.error('영상 업로드 실패:', error);
    return NextResponse.json(
      { error: error.message || '영상 업로드 실패' },
      { status: 500 }
    );
  }
}
