import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getVideoInfo } from '@/lib/vdocipher';

// POST /api/admin/courses/[id]/videos/vdocipher/complete - VdoCipher 업로드 완료 후 DB 저장
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
    const { vdoCipherId, title, description, isPreview, order } = body;

    if (!vdoCipherId) {
      return NextResponse.json({ error: 'vdoCipherId가 필요합니다' }, { status: 400 });
    }

    // 강의 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });
    }

    // VdoCipher에서 영상 정보 가져오기 (1회만 시도, 폴링은 프론트엔드에서 처리)
    let duration = null;

    try {
      const videoInfo = await getVideoInfo(vdoCipherId);
      if (videoInfo.length && videoInfo.length > 0) {
        duration = Math.round(videoInfo.length);
      }
    } catch (error) {
      console.log('VdoCipher video info not available yet (encoding in progress)');
    }

    // DB에 영상 정보 저장
    const video = await prisma.video.create({
      data: {
        courseId,
        vdoCipherId,
        title,
        description: description || null,
        duration,
        order: order || 1,
        isPreview: isPreview || false,
      },
    });

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error('VdoCipher complete error:', error);
    return NextResponse.json(
      { error: '영상 저장 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
