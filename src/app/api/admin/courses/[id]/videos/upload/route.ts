import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Vimeo } from '@vimeo/vimeo';

// 최대 실행 시간 설정
export const maxDuration = 60;

// 1단계: Vimeo 업로드 URL 발급 (TUS 방식)
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

    // Vimeo 토큰 확인
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    if (!vimeoToken || vimeoToken === 'your-vimeo-access-token') {
      return NextResponse.json(
        { error: 'Vimeo API 토큰이 설정되지 않았습니다. .env 파일에 VIMEO_ACCESS_TOKEN을 설정해주세요.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileSize, fileName, title, description, isPreview } = body;

    if (!fileSize || !fileName || !title) {
      return NextResponse.json({ error: '파일 정보와 제목이 필요합니다' }, { status: 400 });
    }

    const { id: courseId } = await params;

    // 강의 정보 조회
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    if (!course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });
    }

    // Vimeo API로 업로드 URL 요청 (TUS 방식)
    const vimeoResponse = await fetch('https://api.vimeo.com/me/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vimeoToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
      },
      body: JSON.stringify({
        upload: {
          approach: 'tus',
          size: fileSize,
        },
        name: `[${course.title}] ${title}`,
        description: `강의: ${course.title}\n\n${description || ''}`,
        privacy: {
          view: 'unlisted',
        },
      }),
    });

    if (!vimeoResponse.ok) {
      const error = await vimeoResponse.json();
      console.error('Vimeo API 오류:', error);
      return NextResponse.json(
        { error: error.error || 'Vimeo 업로드 URL 발급 실패' },
        { status: 500 }
      );
    }

    const vimeoData = await vimeoResponse.json();

    // 응답에서 필요한 정보 추출
    const uploadLink = vimeoData.upload.upload_link;
    const vimeoUri = vimeoData.uri; // /videos/123456789 형태
    const vimeoId = vimeoUri.split('/').pop();

    return NextResponse.json({
      success: true,
      uploadLink,
      vimeoUri,
      vimeoId,
      courseId,
      title,
      description,
      isPreview,
    });
  } catch (error: any) {
    console.error('업로드 URL 발급 실패:', error);
    return NextResponse.json(
      { error: error.message || '업로드 URL 발급 실패' },
      { status: 500 }
    );
  }
}
