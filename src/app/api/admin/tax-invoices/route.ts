import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/admin/tax-invoices - 세금계산서 목록 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // ALL, REQUESTED, ISSUED, CANCELED

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const taxInvoices = await prisma.taxInvoice.findMany({
      where,
      include: {
        purchase: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ taxInvoices });
  } catch (error) {
    console.error('세금계산서 목록 조회 에러:', error);
    return NextResponse.json(
      { error: '세금계산서 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
