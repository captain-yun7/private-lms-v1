import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// PATCH /api/devices/[id] - 기기 이름 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 유효성 검사
    const schema = z.object({
      name: z.string().min(1, '기기 이름을 입력해주세요').max(50),
    });

    const { name } = schema.parse(body);

    // 기기 확인
    const device = await prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json(
        { error: '기기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (device.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // 기기 이름 업데이트
    const updated = await prisma.device.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({ device: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('기기 수정 에러:', error);
    return NextResponse.json(
      { error: '기기 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE /api/devices/[id] - 기기 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { id } = await params;

    // 기기 확인
    const device = await prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json(
        { error: '기기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (device.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // 기기 삭제
    await prisma.device.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('기기 삭제 에러:', error);
    return NextResponse.json(
      { error: '기기 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
