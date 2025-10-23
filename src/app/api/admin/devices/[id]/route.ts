import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// DELETE /api/admin/devices/[id] - 관리자 기기 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
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
