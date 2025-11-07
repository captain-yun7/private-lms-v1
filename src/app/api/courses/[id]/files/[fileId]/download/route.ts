import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]/files/[fileId]/download - 강의 자료 다운로드
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    const { id: courseId, fileId } = await params;

    // 1. 파일 존재 확인
    const file = await prisma.courseFile.findUnique({
      where: { id: fileId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 2. 파일이 해당 강의에 속하는지 확인
    if (file.courseId !== courseId) {
      return NextResponse.json(
        { error: "잘못된 요청입니다" },
        { status: 400 }
      );
    }

    // 3. 수강 권한 확인 (구매자만 다운로드 가능)
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "강의를 수강하고 있지 않습니다. 강의를 구매한 후 다운로드할 수 있습니다." },
        { status: 403 }
      );
    }

    // 4. 파일 URL 반환 (Supabase Storage URL)
    // 클라이언트에서 직접 다운로드하도록 URL 제공
    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
      },
    });
  } catch (error) {
    console.error("파일 다운로드 에러:", error);
    return NextResponse.json(
      { error: "파일 다운로드에 실패했습니다" },
      { status: 500 }
    );
  }
}
