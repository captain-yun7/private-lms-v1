import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// PATCH /api/admin/inquiries/replies/[id] - 답변 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    // 유효성 검사
    const schema = z.object({
      content: z.string().min(10, '답변 내용을 10자 이상 입력해주세요'),
    });

    const { content } = schema.parse(body);

    // 답변 수정
    const reply = await prisma.inquiryReply.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('답변 수정 에러:', error);
    return NextResponse.json(
      { error: '답변 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/inquiries/replies/[id] - 답변 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { id } = params;

    // 답변 확인 및 문의 조회
    const reply = await prisma.inquiryReply.findUnique({
      where: { id },
      select: { inquiryId: true },
    });

    if (!reply) {
      return NextResponse.json(
        { error: '답변을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 답변 삭제 및 문의 상태 업데이트
    await prisma.$transaction([
      prisma.inquiryReply.delete({
        where: { id },
      }),
      // 남은 답변이 없으면 문의 상태를 PENDING으로 변경
      prisma.inquiry.update({
        where: { id: reply.inquiryId },
        data: {
          status: 'PENDING',
        },
      }),
    ]);

    return NextResponse.json({ message: '답변이 삭제되었습니다' });
  } catch (error) {
    console.error('답변 삭제 에러:', error);
    return NextResponse.json(
      { error: '답변 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
