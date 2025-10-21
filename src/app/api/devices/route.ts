import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// GET /api/devices - 내 기기 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const devices = await prisma.device.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error('기기 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '기기 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// POST /api/devices - 기기 등록
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
      name: z.string().optional(),
      userAgent: z.string().optional(),
      platform: z.string().optional(),
      language: z.string().optional(),
    });

    const data = schema.parse(body);

    // 이미 등록된 기기인지 확인
    const existingDevice = await prisma.device.findUnique({
      where: {
        userId_fingerprint: {
          userId: session.user.id,
          fingerprint: data.fingerprint,
        },
      },
    });

    if (existingDevice) {
      // 기존 기기의 lastUsedAt 업데이트
      const updated = await prisma.device.update({
        where: { id: existingDevice.id },
        data: {
          lastUsedAt: new Date(),
        },
      });

      return NextResponse.json({ device: updated });
    }

    // 등록된 기기 수 확인
    const deviceCount = await prisma.device.count({
      where: {
        userId: session.user.id,
      },
    });

    if (deviceCount >= 2) {
      return NextResponse.json(
        {
          error: '최대 2개의 기기만 등록할 수 있습니다',
          code: 'DEVICE_LIMIT_EXCEEDED'
        },
        { status: 400 }
      );
    }

    // 새 기기 등록
    const device = await prisma.device.create({
      data: {
        userId: session.user.id,
        fingerprint: data.fingerprint,
        name: data.name || '새 기기',
        userAgent: data.userAgent,
        platform: data.platform,
        language: data.language,
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({ device }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('기기 등록 에러:', error);
    return NextResponse.json(
      { error: '기기 등록에 실패했습니다' },
      { status: 500 }
    );
  }
}
