import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/receipts/[id] - 영수증 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const receiptId = params.id;

    // 영수증 조회
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
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
                instructorName: true,
              },
            },
            payment: {
              select: {
                method: true,
                paidAt: true,
                orderId: true,
                paymentKey: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { error: "영수증을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 권한 확인: 본인 또는 관리자만 조회 가능
    const isOwner = receipt.purchase.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "영수증을 조회할 권한이 없습니다" },
        { status: 403 }
      );
    }

    return NextResponse.json({ receipt });
  } catch (error) {
    console.error("영수증 조회 에러:", error);
    return NextResponse.json(
      { error: "영수증 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
