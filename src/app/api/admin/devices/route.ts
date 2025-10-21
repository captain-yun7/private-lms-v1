import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/devices - 전체 기기 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = userId ? { userId } : {};

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          lastUsedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.device.count({ where }),
    ]);

    return NextResponse.json({
      devices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('기기 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '기기 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
