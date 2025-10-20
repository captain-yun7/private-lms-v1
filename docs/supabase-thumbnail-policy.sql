-- Supabase Storage: course-thumbnails 버킷 Public 정책
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 버킷 Public 설정
UPDATE storage.buckets
SET public = true
WHERE id = 'course-thumbnails';

-- 2. Public 읽기 권한 추가
CREATE POLICY IF NOT EXISTS "Public read access for course thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

-- 3. 관리자 업로드 권한 추가 (선택적)
CREATE POLICY IF NOT EXISTS "Admin upload access for course thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-thumbnails'
  AND auth.role() = 'authenticated'
);

-- 4. 관리자 삭제 권한 추가 (선택적)
CREATE POLICY IF NOT EXISTS "Admin delete access for course thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-thumbnails'
  AND auth.role() = 'authenticated'
);

-- 확인
SELECT * FROM storage.buckets WHERE id = 'course-thumbnails';
SELECT * FROM storage.policies WHERE bucket_id = 'course-thumbnails';
