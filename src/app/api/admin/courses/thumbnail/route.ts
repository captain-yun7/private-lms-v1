import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin, COURSE_THUMBNAILS_BUCKET } from '@/lib/supabase';

// POST /api/admin/courses/thumbnail - 썸네일 이미지 업로드
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // 관리자 권한 확인
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 이미지 파일 확인
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다. (jpg, png, webp, gif)' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedFileName}`;

    // Supabase Storage에 업로드
    const fileBuffer = await file.arrayBuffer();
    const { data, error } = await supabaseAdmin.storage
      .from(COURSE_THUMBNAILS_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Public URL 생성
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(COURSE_THUMBNAILS_BUCKET)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileName,
      fileUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error('썸네일 업로드 오류:', error);
    return NextResponse.json(
      { error: '썸네일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
