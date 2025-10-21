import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 환불 신청 스키마
const refundRequestSchema = z.object({
  purchaseId: z.string(),
  reason: z.string().min(10, "환불 사유를 10자 이상 입력해주세요"),
  accountBank: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
});

// POST /api/refunds - 환불 신청
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { purchaseId, reason, accountBank, accountNumber, accountHolder } =
      refundRequestSchema.parse(body);

    // Purchase 조회
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        payment: true,
        course: {
          select: {
            title: true,
          },
        },
        refund: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "구매 내역을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 본인 구매 내역인지 확인
    if (purchase.userId !== session.user.id) {
      return NextResponse.json(
        { error: "환불 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 이미 환불 신청한 경우
    if (purchase.refund) {
      return NextResponse.json(
        { error: "이미 환불 신청된 구매입니다" },
        { status: 400 }
      );
    }

    // 환불 가능 상태 확인
    if (purchase.status === "REFUNDED") {
      return NextResponse.json(
        { error: "이미 환불 완료된 구매입니다" },
        { status: 400 }
      );
    }

    if (purchase.status === "CANCELED") {
      return NextResponse.json(
        { error: "취소된 구매는 환불할 수 없습니다" },
        { status: 400 }
      );
    }

    if (purchase.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "결제가 완료되지 않은 구매입니다" },
        { status: 400 }
      );
    }

    // 무통장입금인 경우 계좌 정보 필수
    if (purchase.payment?.method === "BANK_TRANSFER") {
      if (!accountBank || !accountNumber || !accountHolder) {
        return NextResponse.json(
          { error: "환불 계좌 정보를 입력해주세요" },
          { status: 400 }
        );
      }
    }

    // 환불 신청 생성
    const refund = await prisma.refund.create({
      data: {
        purchaseId,
        reason,
        refundAmount: purchase.amount,
        accountBank: accountBank || null,
        accountNumber: accountNumber || null,
        accountHolder: accountHolder || null,
        status: "PENDING",
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
    });

    return NextResponse.json({
      success: true,
      message: "환불 신청이 완료되었습니다. 관리자 승인 후 처리됩니다.",
      refund: {
        id: refund.id,
        status: refund.status,
        courseName: refund.purchase.course.title,
        refundAmount: refund.refundAmount,
      },
    });
  } catch (error) {
    console.error("환불 신청 에러:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "잘못된 요청 데이터입니다", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "환불 신청에 실패했습니다" },
      { status: 500 }
    );
  }
}
