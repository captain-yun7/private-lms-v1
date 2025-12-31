import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/vdocipher';

// POST /api/videos/[videoId]/otp - VdoCipher OTP 발급
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { videoId } = await params;

    // 영상 정보 조회
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: '영상을 찾을 수 없습니다' }, { status: 404 });
    }

    // VdoCipher ID 확인
    if (!video.vdoCipherId) {
      return NextResponse.json({ error: '이 영상은 VdoCipher를 사용하지 않습니다' }, { status: 400 });
    }

    // 수강 권한 확인 (미리보기 영상은 제외)
    const isEnrolled = video.course.enrollments.length > 0;
    const isAdmin = session.user.role === 'ADMIN';

    if (!video.isPreview && !isEnrolled && !isAdmin) {
      return NextResponse.json({ error: '수강 권한이 없습니다' }, { status: 403 });
    }

    // 사용자 정보로 워터마크 생성
    const userEmail = session.user.email || 'Unknown';
    const userId = session.user.id;

    // OTP 발급 (워터마크 포함)
    const otpData = await generateOTP(video.vdoCipherId, {
      ttl: 300, // 5분
      watermark: {
        text: `${userEmail}`,
        alpha: '0.4',
        color: '0xFFFFFF',
        size: '12',
        interval: '5000',
      },
    });

    return NextResponse.json({
      otp: otpData.otp,
      playbackInfo: otpData.playbackInfo,
    });
  } catch (error) {
    console.error('OTP generation error:', error);
    return NextResponse.json(
      { error: 'OTP 발급 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
