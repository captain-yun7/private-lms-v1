import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin, COURSE_FILES_BUCKET } from '@/lib/supabase';

// DELETE /api/admin/files/[id] - 강의 자료 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 관리자 권한 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const fileId = params.id;

    // 파일 정보 조회
    const file = await prisma.courseFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다' }, { status: 404 });
    }

    // Supabase Storage에서 파일 URL로 경로 추출
    try {
      const url = new URL(file.fileUrl);
      const pathParts = url.pathname.split(`/${COURSE_FILES_BUCKET}/`);
      if (pathParts.length > 1) {
        const filePath = pathParts[1];

        // Supabase Storage에서 파일 삭제
        const { error: deleteError } = await supabaseAdmin.storage
          .from(COURSE_FILES_BUCKET)
          .remove([filePath]);

        if (deleteError) {
          console.error('Supabase delete error:', deleteError);
          // Storage 삭제 실패해도 DB는 삭제 진행
        }
      }
    } catch (urlError) {
      console.error('Error parsing file URL:', urlError);
      // URL 파싱 실패해도 DB는 삭제 진행
    }

    // DB에서 파일 정보 삭제
    await prisma.courseFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: '파일 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
