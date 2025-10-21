import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/refunds/[id]/approve - 환불 승인
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // 관리자 권한 확인
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 }
      );
    }

    const { id } = params;

    // 환불 신청 조회
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        purchase: {
          include: {
            payment: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!refund) {
      return NextResponse.json(
        { error: "환불 신청을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 이미 처리된 환불인지 확인
    if (refund.status !== "PENDING") {
      return NextResponse.json(
        { error: "이미 처리된 환불 신청입니다" },
        { status: 400 }
      );
    }

    const { purchase, payment } = refund.purchase;

    // ========================================
    // TossPayments API 제한: 1년 경과 여부 확인
    // ========================================
    // 카드 결제인 경우, 결제일로부터 1년이 경과하면 TossPayments API로 자동 취소 불가
    // 1년 경과 시 수동 환불로 안내
    if (payment.method === "CARD" && payment.paymentKey && payment.paidAt) {
      const paymentDate = new Date(payment.paidAt);
      const now = new Date();
      const yearsDiff = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

      if (yearsDiff > 1) {
        // 1년 경과: API 호출하지 않고 수동 처리 안내
        return NextResponse.json(
          {
            success: false,
            requireManualRefund: true,
            error: "자동 환불이 불가능합니다",
            detail: "결제일로부터 1년이 경과하여 TossPayments API로 자동 취소가 불가능합니다.",
            instruction: "관리자가 직접 고객 계좌로 환불 처리해주세요.",
            refundInfo: {
              amount: refund.refundAmount,
              userName: refund.purchase.user.name,
              userEmail: refund.purchase.user.email,
              accountInfo: refund.accountBank && refund.accountNumber && refund.accountHolder
                ? `${refund.accountBank} ${refund.accountNumber} (${refund.accountHolder})`
                : "환불 계좌 정보 없음 - 고객에게 문의 필요",
            },
            paymentDate: payment.paidAt,
            yearsElapsed: parseFloat(yearsDiff.toFixed(2)),
          },
          { status: 400 }
        );
      }
    }

    // 카드 결제인 경우 토스페이먼츠 API로 환불 처리
    if (payment.method === "CARD" && payment.paymentKey) {
      const secretKey = process.env.TOSS_SECRET_KEY;

      if (!secretKey) {
        return NextResponse.json(
          { error: "결제 설정이 올바르지 않습니다" },
          { status: 500 }
        );
      }

      try {
        // 토스페이먼츠 결제 취소 API 호출
        const tossResponse = await fetch(
          `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(secretKey + ":").toString(
                "base64"
              )}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cancelReason: refund.reason,
            }),
          }
        );

        if (!tossResponse.ok) {
          const errorData = await tossResponse.json();
          console.error("토스페이먼츠 취소 실패:", errorData);
          return NextResponse.json(
            {
              error: errorData.message || "결제 취소에 실패했습니다",
              details: errorData,
            },
            { status: tossResponse.status }
          );
        }

        // 토스페이먼츠 취소 성공
        const tossData = await tossResponse.json();
        console.log("토스페이먼츠 취소 성공:", tossData);
      } catch (tossError) {
        console.error("토스페이먼츠 API 호출 에러:", tossError);
        return NextResponse.json(
          { error: "결제 취소 API 호출에 실패했습니다" },
          { status: 500 }
        );
      }
    }

    // 트랜잭션으로 환불 처리
    await prisma.$transaction(async (tx) => {
      // 1. Refund 상태 업데이트
      await tx.refund.update({
        where: { id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
        },
      });

      // 2. Purchase 상태 업데이트
      await tx.purchase.update({
        where: { id: refund.purchaseId },
        data: {
          status: "REFUNDED",
        },
      });

      // 3. Payment 상태 업데이트
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "CANCELED",
        },
      });

      // 4. Enrollment 삭제 (수강 등록 취소)
      await tx.enrollment.deleteMany({
        where: {
          userId: refund.purchase.userId,
          courseId: refund.purchase.courseId,
        },
      });

      // 5. Progress 삭제 (진도 기록 삭제 - optional)
      // 진도 기록은 유지할 수도 있지만, 환불 시 삭제하는 것이 일반적
      const courseVideos = await tx.video.findMany({
        where: { courseId: refund.purchase.courseId },
        select: { id: true },
      });

      if (courseVideos.length > 0) {
        await tx.progress.deleteMany({
          where: {
            userId: refund.purchase.userId,
            videoId: {
              in: courseVideos.map((v) => v.id),
            },
          },
        });
      }
    });

    // TODO: 이메일 알림 발송
    // 무통장입금인 경우 계좌 정보 포함하여 안내
    // await sendEmail({
    //   to: refund.purchase.user.email,
    //   subject: '환불이 승인되었습니다',
    //   body: `...`,
    // });

    return NextResponse.json({
      success: true,
      message:
        payment.method === "CARD"
          ? "환불이 승인되었습니다. 카드사를 통해 환불 처리됩니다."
          : "환불이 승인되었습니다. 입력하신 계좌로 환불 처리됩니다.",
      refundMethod: payment.method,
    });
  } catch (error) {
    console.error("환불 승인 에러:", error);
    return NextResponse.json(
      { error: "환불 승인에 실패했습니다" },
      { status: 500 }
    );
  }
}
