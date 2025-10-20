import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 진도 업데이트 스키마
const progressSchema = z.object({
  videoId: z.string(),
  lastPosition: z.number().min(0),
  isCompleted: z.boolean().optional(),
});

// POST /api/progress - 진도 저장/업데이트
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = progressSchema.parse(body);

    const { videoId, lastPosition, isCompleted } = validatedData;

    // 비디오 존재 확인
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, duration: true },
    });

    if (!video) {
      return NextResponse.json(
        { error: '비디오를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 완료 조건: isCompleted가 true이거나, lastPosition이 비디오의 90% 이상
    const shouldComplete =
      isCompleted || (video.duration && lastPosition >= video.duration * 0.9);

    // 진도 저장 또는 업데이트
    const progress = await prisma.progress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
      update: {
        lastPosition,
        isCompleted: shouldComplete,
        completedAt: shouldComplete ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        videoId,
        lastPosition,
        isCompleted: shouldComplete,
        completedAt: shouldComplete ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('진도 저장 오류:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '진도를 저장하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// GET /api/progress?videoId=xxx - 특정 비디오의 진도 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const courseId = searchParams.get('courseId');

    if (videoId) {
      // 특정 비디오의 진도 조회
      const progress = await prisma.progress.findUnique({
        where: {
          userId_videoId: {
            userId: session.user.id,
            videoId,
          },
        },
      });

      return NextResponse.json({
        progress: progress || null,
      });
    } else if (courseId) {
      // 강의 전체 진도 조회
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
          videos: {
            select: {
              id: true,
              title: true,
              duration: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: '강의를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      const videoIds = course.videos.map((v) => v.id);

      const progresses = await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          videoId: { in: videoIds },
        },
      });

      // 진도율 계산
      const totalVideos = course.videos.length;
      const completedVideos = progresses.filter((p) => p.isCompleted).length;
      const progressRate =
        totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      return NextResponse.json({
        progresses,
        totalVideos,
        completedVideos,
        progressRate,
      });
    } else {
      return NextResponse.json(
        { error: 'videoId 또는 courseId를 제공해야 합니다.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('진도 조회 오류:', error);
    return NextResponse.json(
      { error: '진도를 조회하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
