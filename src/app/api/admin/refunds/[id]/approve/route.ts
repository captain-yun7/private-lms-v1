import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/refunds/[id]/approve - 환불 승인
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // 요청 본문에서 환불 금액과 수강권 유지 여부 확인
    let requestedRefundAmount: number | undefined;
    let keepEnrollment = false; // 부분 환불 시 수강권 유지 여부

    try {
      const body = await request.json();
      requestedRefundAmount = body.refundAmount;
      keepEnrollment = body.keepEnrollment ?? false;
    } catch {
      // body가 없으면 기본값 사용 (기존 호환성 유지)
    }

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

    const purchase = refund.purchase;
    const payment = refund.purchase.payment;

    // 결제 정보 확인
    if (!payment) {
      return NextResponse.json(
        { error: "결제 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // ========================================
    // 환불 금액 검증
    // ========================================
    // 요청된 금액이 있으면 사용, 없으면 신청된 금액 사용
    const finalRefundAmount = requestedRefundAmount ?? refund.refundAmount;

    // 환불 금액 검증
    if (finalRefundAmount <= 0) {
      return NextResponse.json(
        { error: "환불 금액은 0원보다 커야 합니다" },
        { status: 400 }
      );
    }

    if (finalRefundAmount > purchase.amount) {
      return NextResponse.json(
        {
          error: "환불 금액이 원결제 금액을 초과합니다",
          detail: `원결제 금액: ${purchase.amount.toLocaleString()}원, 요청 금액: ${finalRefundAmount.toLocaleString()}원`
        },
        { status: 400 }
      );
    }

    // 전액 환불인지 부분 환불인지 확인
    const isPartialRefund = finalRefundAmount < purchase.amount;

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
        // 부분 환불 시 cancelAmount 지정, 전액 환불 시 생략
        const cancelBody: { cancelReason: string; cancelAmount?: number } = {
          cancelReason: refund.reason || "고객 요청에 의한 환불",
        };

        // 부분 환불인 경우에만 cancelAmount 지정
        if (isPartialRefund) {
          cancelBody.cancelAmount = finalRefundAmount;
        }

        console.log("[환불] 토스페이먼츠 취소 요청:", {
          paymentKey: payment.paymentKey,
          isPartialRefund,
          cancelAmount: cancelBody.cancelAmount,
          originalAmount: purchase.amount,
        });

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
            body: JSON.stringify(cancelBody),
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
      // 1. Refund 상태 및 실제 환불 금액 업데이트
      await tx.refund.update({
        where: { id },
        data: {
          status: "COMPLETED",
          refundAmount: finalRefundAmount, // 실제 환불된 금액으로 업데이트
          processedAt: new Date(),
        },
      });

      // 2. Purchase 상태 업데이트
      // 부분 환불 + 수강권 유지인 경우 COMPLETED 유지, 그 외에는 REFUNDED
      const newPurchaseStatus = isPartialRefund && keepEnrollment ? "COMPLETED" : "REFUNDED";
      await tx.purchase.update({
        where: { id: refund.purchaseId },
        data: {
          status: newPurchaseStatus,
        },
      });

      // 3. Payment 상태 업데이트
      // 부분 환불인 경우 COMPLETED 유지 (추가 환불 가능), 전액 환불인 경우 CANCELED
      const newPaymentStatus = isPartialRefund ? "COMPLETED" : "CANCELED";
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
        },
      });

      // 4. 수강권 처리 (전액 환불 또는 부분 환불 + 수강권 취소인 경우에만)
      if (!isPartialRefund || !keepEnrollment) {
        // Enrollment 삭제 (수강 등록 취소)
        await tx.enrollment.deleteMany({
          where: {
            userId: purchase.userId,
            courseId: purchase.courseId,
          },
        });

        // 5. Progress 삭제 (진도 기록 삭제)
        const courseVideos = await tx.video.findMany({
          where: { courseId: purchase.courseId },
          select: { id: true },
        });

        if (courseVideos.length > 0) {
          await tx.progress.deleteMany({
            where: {
              userId: purchase.userId,
              videoId: {
                in: courseVideos.map((v) => v.id),
              },
            },
          });
        }
      }
    });

    console.log("[환불] 처리 완료:", {
      refundId: id,
      isPartialRefund,
      finalRefundAmount,
      keepEnrollment,
    });

    // TODO: 이메일 알림 발송
    // 무통장입금인 경우 계좌 정보 포함하여 안내
    // await sendEmail({
    //   to: refund.purchase.user.email,
    //   subject: '환불이 승인되었습니다',
    //   body: `...`,
    // });

    // 응답 메시지 생성
    let message = "";
    if (isPartialRefund) {
      message = `부분 환불(${finalRefundAmount.toLocaleString()}원)이 승인되었습니다.`;
      if (keepEnrollment) {
        message += " 수강권은 유지됩니다.";
      } else {
        message += " 수강권이 취소되었습니다.";
      }
    } else {
      message = payment.method === "CARD"
        ? "환불이 승인되었습니다. 카드사를 통해 환불 처리됩니다."
        : "환불이 승인되었습니다. 입력하신 계좌로 환불 처리됩니다.";
    }

    return NextResponse.json({
      success: true,
      message,
      refundMethod: payment.method,
      refundAmount: finalRefundAmount,
      isPartialRefund,
      keepEnrollment: isPartialRefund ? keepEnrollment : false,
    });
  } catch (error) {
    console.error("환불 승인 에러:", error);
    return NextResponse.json(
      { error: "환불 승인에 실패했습니다" },
      { status: 500 }
    );
  }
}
