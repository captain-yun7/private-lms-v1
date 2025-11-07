import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin, COURSE_FILES_BUCKET } from '@/lib/supabase';

// POST /api/admin/courses/[id]/files - 강의 자료 업로드
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 권한 확인
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    const { id: courseId } = await params;

    // 강의 존재 확인
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다' }, { status: 404 });
    }

    // FormData에서 파일 추출
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다' }, { status: 400 });
    }

    // 파일 크기 제한 (100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '파일 크기는 100MB를 초과할 수 없습니다' }, { status: 400 });
    }

    // 파일 이름 생성 (중복 방지)
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9가-힣.\-_]/g, '_');
    const fileName = `${courseId}/${timestamp}_${sanitizedFileName}`;

    // Supabase Storage에 파일 업로드
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(COURSE_FILES_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: `파일 업로드 실패: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Public URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from(COURSE_FILES_BUCKET)
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return NextResponse.json({ error: '파일 URL 생성 실패' }, { status: 500 });
    }

    // DB에 파일 정보 저장
    const courseFile = await prisma.courseFile.create({
      data: {
        courseId,
        fileName: sanitizedFileName,
        fileUrl: urlData.publicUrl,
        fileSize: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      file: courseFile,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
