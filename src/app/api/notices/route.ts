import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notices - 공지사항 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 공지사항 목록 조회 (중요 공지 상단 고정)
    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          isPinned: true,
          views: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { isPinned: "desc" }, // 중요 공지 상단 고정
          { createdAt: "desc" }, // 최신순
        ],
        skip,
        take: limit,
      }),
      prisma.notice.count(),
    ]);

    return NextResponse.json({
      notices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("공지사항 목록 조회 에러:", error);
    return NextResponse.json(
      { error: "공지사항 목록을 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}
