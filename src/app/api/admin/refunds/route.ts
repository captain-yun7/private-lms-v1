import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/refunds - 환불 신청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자 권한 확인
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";

    // 환불 목록 조회
    const whereClause: any = {};

    if (status !== "ALL") {
      whereClause.status = status;
    }

    const refunds = await prisma.refund.findMany({
      where: whereClause,
      include: {
        purchase: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            course: {
              select: {
                title: true,
              },
            },
            payment: {
              select: {
                method: true,
                paymentKey: true,
              },
            },
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error("환불 목록 조회 에러:", error);
    return NextResponse.json(
      { error: "환불 목록 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
