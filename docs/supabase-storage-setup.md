# Supabase Storage 설정 가이드

강의 자료 업로드 기능을 사용하려면 Supabase Storage를 설정해야 합니다.

## 1. Supabase 프로젝트 설정

### 1-1. Supabase 환경변수 확인
`.env.local` 파일에 다음 환경변수가 설정되어 있어야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL="https://kkwuhihbhztfwjvhfaiz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**환경변수 확인 방법:**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** > **API** 메뉴로 이동
4. **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
5. **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. **service_role** (비밀): `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **주의**: `service_role` 키는 절대 클라이언트에 노출되면 안 됩니다!

## 2. Storage Bucket 생성

### 2-1. 버킷 생성
1. Supabase Dashboard에서 **Storage** 메뉴로 이동
2. **New bucket** 클릭
3. 버킷 이름: `course-files` (정확히 이 이름 사용)
4. **Public bucket** 체크 ✅ (파일 다운로드를 위해 필요)
5. **Create bucket** 클릭

### 2-2. 버킷 정책 설정 (선택적)

기본 Public 설정으로도 작동하지만, 보안을 강화하려면 다음 정책을 추가할 수 있습니다:

```sql
-- Storage > Policies > New Policy

-- 1. 관리자만 업로드 가능 (이미 API에서 체크하므로 선택적)
CREATE POLICY "Admin can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'course-files');

-- 2. 모든 사용자가 다운로드 가능
CREATE POLICY "Anyone can download files"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-files');

-- 3. 관리자만 삭제 가능
CREATE POLICY "Admin can delete files"
ON storage.objects FOR DELETE
USING (bucket_id = 'course-files');
```

## 3. 파일 크기 제한

현재 설정된 제한:
- **최대 파일 크기**: 100MB
- 코드 위치: `/src/app/api/admin/courses/[id]/files/route.ts`

파일 크기 제한을 변경하려면 다음 라인을 수정하세요:

```typescript
// 파일 크기 제한 (100MB)
const maxSize = 100 * 1024 * 1024; // 100MB
```

## 4. 지원되는 파일 형식

현재 모든 파일 형식이 허용됩니다. 특정 형식만 허용하려면 코드를 수정하세요:

```typescript
// 예: PDF와 문서 파일만 허용
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

if (!allowedTypes.includes(file.type)) {
  return NextResponse.json(
    { error: '지원하지 않는 파일 형식입니다' },
    { status: 400 }
  );
}
```

## 5. 테스트

### 5-1. 파일 업로드 테스트
1. 관리자로 로그인
2. 강의 관리 > 강의 선택 > 수정
3. **강의 자료 관리** 섹션에서 **+ 파일 추가** 클릭
4. 파일 선택 후 **파일 업로드** 클릭
5. Supabase Storage에서 파일 확인:
   - Storage > `course-files` > `[courseId]` 폴더

### 5-2. 파일 다운로드 테스트
1. 강의 상세 페이지에서 강의 자료 섹션 확인
2. **다운로드** 버튼 클릭
3. 파일이 정상적으로 다운로드되는지 확인

### 5-3. 파일 삭제 테스트
1. 관리자 페이지에서 파일 삭제
2. Supabase Storage에서 파일이 삭제되었는지 확인

## 6. 문제 해결

### 에러: "The resource already exists"
- 같은 이름의 파일이 이미 존재합니다
- 파일은 `timestamp_filename` 형식으로 저장되므로 정상적으로는 발생하지 않습니다
- 발생 시: Supabase Storage에서 수동으로 파일 삭제

### 에러: "Row Level Security policy violation"
- Bucket 정책 문제입니다
- Storage > Policies에서 정책 확인
- 또는 Bucket을 **Public**으로 설정

### 파일 업로드는 되지만 다운로드가 안 됨
- Bucket이 **Public**으로 설정되어 있는지 확인
- Storage > Buckets > `course-files` > **Make public** 클릭

### 업로드 후 URL이 작동하지 않음
- `getPublicUrl()` 대신 `createSignedUrl()` 사용 고려 (Private files)
- 현재는 Public URL 사용 중

## 7. 향후 개선 사항

1. **진행률 표시**: 대용량 파일 업로드 시 진행률 표시
2. **이미지 최적화**: 이미지 파일 자동 리사이징
3. **바이러스 검사**: 업로드 파일 검사
4. **CDN 연동**: 빠른 다운로드를 위한 CDN 설정
5. **파일 압축**: ZIP 파일 자동 압축/해제

## 8. 비용 관리

Supabase Free Tier:
- **Storage**: 1GB
- **Bandwidth**: 2GB/월

초과 시:
- Pro Plan: $25/월 (100GB storage, 250GB bandwidth)
- 추가 storage: $0.021/GB
- 추가 bandwidth: $0.09/GB

**비용 절감 팁:**
- 대용량 파일은 외부 CDN 사용
- 불필요한 파일 정기적으로 삭제
- 파일 압축 권장
