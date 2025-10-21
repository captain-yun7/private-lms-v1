import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// POST /api/tax-invoices - 세금계산서 발급 요청
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();

    // 유효성 검사
    const schema = z.object({
      purchaseId: z.string(),
      businessNumber: z.string().min(10, '사업자등록번호를 정확히 입력해주세요'),
      companyName: z.string().min(1, '상호명을 입력해주세요'),
      ceoName: z.string().min(1, '대표자명을 입력해주세요'),
      address: z.string().min(1, '사업장 주소를 입력해주세요'),
      businessType: z.string().optional(),
      businessItem: z.string().optional(),
      email: z.string().email('유효한 이메일을 입력해주세요'),
      phone: z.string().min(1, '연락처를 입력해주세요'),
    });

    const data = schema.parse(body);

    // Purchase 확인 (본인 구매인지 확인)
    const purchase = await prisma.purchase.findUnique({
      where: { id: data.purchaseId },
      include: {
        course: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: '구매 내역을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (purchase.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }

    // 이미 세금계산서 발급 요청이 있는지 확인
    const existing = await prisma.taxInvoice.findUnique({
      where: { purchaseId: data.purchaseId },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 세금계산서 발급 요청이 존재합니다' },
        { status: 400 }
      );
    }

    // 세금계산서 발급 요청 생성
    const taxInvoice = await prisma.taxInvoice.create({
      data: {
        purchaseId: data.purchaseId,
        businessNumber: data.businessNumber,
        companyName: data.companyName,
        ceoName: data.ceoName,
        address: data.address,
        businessType: data.businessType,
        businessItem: data.businessItem,
        email: data.email,
        phone: data.phone,
        amount: purchase.amount,
        status: 'REQUESTED',
      },
    });

    return NextResponse.json({ taxInvoice }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('세금계산서 발급 요청 에러:', error);
    return NextResponse.json(
      { error: '세금계산서 발급 요청에 실패했습니다' },
      { status: 500 }
    );
  }
}

// GET /api/tax-invoices - 내 세금계산서 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const taxInvoices = await prisma.taxInvoice.findMany({
      where: {
        purchase: {
          userId: session.user.id,
        },
      },
      include: {
        purchase: {
          include: {
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
