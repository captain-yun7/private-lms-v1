import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 공지사항 생성 스키마
const createNoticeSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  isPinned: z.boolean().optional().default(false),
});

// GET /api/admin/notices - 관리자: 공지사항 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
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

// POST /api/admin/notices - 관리자: 공지사항 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, isPinned } = createNoticeSchema.parse(body);

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        isPinned,
      },
    });

    return NextResponse.json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error("공지사항 생성 에러:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "잘못된 요청 데이터입니다", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "공지사항 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
