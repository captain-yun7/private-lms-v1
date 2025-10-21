import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const rejectSchema = z.object({
  rejectReason: z.string().min(10, "거절 사유를 10자 이상 입력해주세요"),
});

// POST /api/admin/refunds/[id]/reject - 환불 거절
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
    const body = await request.json();
    const { rejectReason } = rejectSchema.parse(body);

    // 환불 신청 조회
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        purchase: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
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

    // 환불 거절 처리
    await prisma.refund.update({
      where: { id },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
        rejectReason,
      },
    });

    // TODO: 이메일 알림 발송
    // await sendEmail({
    //   to: refund.purchase.user.email,
    //   subject: '환불 신청이 거절되었습니다',
    //   body: `거절 사유: ${rejectReason}`,
    // });

    return NextResponse.json({
      success: true,
      message: "환불 신청이 거절되었습니다",
    });
  } catch (error) {
    console.error("환불 거절 에러:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "잘못된 요청 데이터입니다", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "환불 거절에 실패했습니다" },
      { status: 500 }
    );
  }
}
