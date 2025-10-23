import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// POST /api/admin/inquiries/[id]/reply - 문의 답변 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { id: inquiryId } = params;
    const body = await request.json();

    // 유효성 검사
    const schema = z.object({
      content: z.string().min(10, '답변 내용을 10자 이상 입력해주세요'),
    });

    const { content } = schema.parse(body);

    // 문의 확인
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 답변 생성 및 문의 상태 업데이트
    const [reply] = await prisma.$transaction([
      prisma.inquiryReply.create({
        data: {
          content,
          inquiryId,
          adminId: session.user.id,
        },
      }),
      prisma.inquiry.update({
        where: { id: inquiryId },
        data: {
          status: 'ANSWERED',
        },
      }),
    ]);

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('답변 작성 에러:', error);
    return NextResponse.json(
      { error: '답변 작성에 실패했습니다' },
      { status: 500 }
    );
  }
}
