import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 공지사항 수정 스키마
const updateNoticeSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").optional(),
  content: z.string().min(1, "내용을 입력해주세요").optional(),
  isPinned: z.boolean().optional(),
});

// PATCH /api/admin/notices/[id] - 관리자: 공지사항 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const data = updateNoticeSchema.parse(body);

    const notice = await prisma.notice.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error("공지사항 수정 에러:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "잘못된 요청 데이터입니다", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "공지사항 수정에 실패했습니다" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/notices/[id] - 관리자: 공지사항 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { id } = params;

    await prisma.notice.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "공지사항이 삭제되었습니다",
    });
  } catch (error) {
    console.error("공지사항 삭제 에러:", error);
    return NextResponse.json(
      { error: "공지사항 삭제에 실패했습니다" },
      { status: 500 }
    );
  }
}
