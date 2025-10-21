import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST /api/admin/tax-invoices/[id]/issue - 세금계산서 발행 처리
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { id } = params;

    // 세금계산서 확인
    const taxInvoice = await prisma.taxInvoice.findUnique({
      where: { id },
    });

    if (!taxInvoice) {
      return NextResponse.json(
        { error: '세금계산서를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (taxInvoice.status !== 'REQUESTED') {
      return NextResponse.json(
        { error: '발급 대기 중인 세금계산서만 처리할 수 있습니다' },
        { status: 400 }
      );
    }

    // 세금계산서 발행 처리
    const updated = await prisma.taxInvoice.update({
      where: { id },
      data: {
        status: 'ISSUED',
        issuedAt: new Date(),
      },
    });

    return NextResponse.json({ taxInvoice: updated });
  } catch (error) {
    console.error('세금계산서 발행 에러:', error);
    return NextResponse.json(
      { error: '세금계산서 발행에 실패했습니다' },
      { status: 500 }
    );
  }
}
