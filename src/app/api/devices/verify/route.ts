import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// POST /api/devices/verify - 기기 검증 (강의 시청 전)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();

    // 유효성 검사
    const schema = z.object({
      fingerprint: z.string().min(1, '기기 고유값이 필요합니다'),
    });

    const { fingerprint } = schema.parse(body);

    // 기기 확인
    const device = await prisma.device.findUnique({
      where: {
        userId_fingerprint: {
          userId: session.user.id,
          fingerprint,
        },
      },
    });

    if (!device) {
      // 등록되지 않은 기기 - 등록 가능 여부 확인
      const deviceCount = await prisma.device.count({
        where: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        verified: false,
        registered: false,
        canRegister: deviceCount < 2,
        deviceCount,
        maxDevices: 2,
      });
    }

    // 등록된 기기 - lastUsedAt 업데이트
    await prisma.device.update({
      where: { id: device.id },
      data: {
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({
      verified: true,
      registered: true,
      device,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('기기 검증 에러:', error);
    return NextResponse.json(
      { error: '기기 검증에 실패했습니다' },
      { status: 500 }
    );
  }
}
