import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getUploadCredentials } from '@/lib/vdocipher';

// POST /api/admin/courses/[id]/videos/vdocipher - VdoCipher 업로드 자격증명 발급
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 권한 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { id: courseId } = await params;
    const body = await request.json();
    const { title, description, isPreview } = body;

    // 강의 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });
    }

    // VdoCipher 업로드 자격증명 발급
    const videoTitle = `[${course.title}] ${title}`;
    const credentials = await getUploadCredentials(videoTitle);

    // 현재 영상 개수 조회 (순서 결정용)
    const videoCount = await prisma.video.count({
      where: { courseId },
    });

    return NextResponse.json({
      credentials: credentials.clientPayload,
      vdoCipherId: credentials.videoId,
      courseId,
      title,
      description,
      isPreview: isPreview || false,
      order: videoCount + 1,
    });
  } catch (error) {
    console.error('VdoCipher credentials error:', error);
    return NextResponse.json(
      { error: 'VdoCipher 업로드 준비 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
