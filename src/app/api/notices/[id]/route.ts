import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notices/[id] - 공지사항 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 공지사항 조회 및 조회수 증가
    const notice = await prisma.notice.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        isPinned: true,
        views: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!notice) {
      return NextResponse.json(
        { error: "공지사항을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ notice });
  } catch (error) {
    console.error("공지사항 상세 조회 에러:", error);
    return NextResponse.json(
      { error: "공지사항을 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}
