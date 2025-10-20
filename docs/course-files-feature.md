# 강의 자료 업로드 기능 구현 완료

## 📦 구현된 기능

### 1. **관리자 - 강의 자료 관리**
- **위치**: `/admin/courses/[id]` (강의 수정 페이지)
- **기능**:
  - 파일 업로드 (Supabase Storage)
  - 파일 목록 표시
  - 파일 다운로드
  - 파일 삭제
  - 파일 크기 제한: 100MB

### 2. **학생 - 강의 자료 다운로드**
- **강의 상세 페이지** (`/courses/[id]`):
  - 강의 자료 목록 표시
  - 파일명, 파일 크기 표시
  - 다운로드 버튼 (새 창)
- **수강 페이지** (`/learn/[courseId]`):
  - 사이드바에서 강의 자료 접근
  - 수강 중 언제든 다운로드 가능

## 🛠️ 구현된 파일

### Frontend
```
src/app/admin/courses/[id]/page.tsx
├── CourseFile interface 추가
├── 강의 자료 관리 UI
├── handleFileUploadSubmit() - 파일 업로드
├── handleDeleteFile() - 파일 삭제
└── formatFileSize() - 파일 크기 포맷팅
```

### Backend API
```
src/app/api/admin/courses/[id]/files/route.ts
└── POST - 파일 업로드 (Supabase Storage + DB)

src/app/api/admin/files/[id]/route.ts
└── DELETE - 파일 삭제 (Supabase Storage + DB)

src/app/api/admin/courses/[id]/route.ts
└── GET - 강의 조회 시 파일 정보 포함
```

### Library
```
src/lib/supabase.ts
├── supabase - Public client
├── supabaseAdmin - Admin client (서버 전용)
└── COURSE_FILES_BUCKET - 버킷 이름 상수
```

## 📝 사용 방법

### 1. Supabase Storage 설정

**필수 환경변수** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Storage Bucket 생성**:
1. Supabase Dashboard > Storage
2. **New bucket** 클릭
3. 이름: `course-files`
4. **Public bucket** 체크 ✅
5. Create

### 2. 관리자 - 파일 업로드
1. 로그인 (관리자 계정)
2. `/admin/courses` > 강의 선택
3. **강의 자료 관리** 섹션에서 **+ 파일 추가**
4. 파일 선택 (최대 100MB)
5. **파일 업로드** 클릭

### 3. 학생 - 파일 다운로드
1. 강의 상세 페이지 또는 수강 페이지 접속
2. 강의 자료 섹션에서 **다운로드** 클릭

## 🔒 보안

### 권한 체크
- **업로드**: 관리자만 가능 (API에서 role 체크)
- **다운로드**: Public URL (누구나 접근 가능)
  - 추후 수강생만 다운로드하도록 변경 가능

### 파일 저장 구조
```
course-files/
└── [courseId]/
    ├── [timestamp]_filename1.pdf
    ├── [timestamp]_filename2.zip
    └── ...
```

### 파일명 처리
- 특수문자 제거 (보안)
- Timestamp 추가 (중복 방지)
- 한글 파일명 지원

## 📊 데이터베이스

### CourseFile Model
```prisma
model CourseFile {
  id        String   @id @default(cuid())
  courseId  String
  fileName  String   // 원본 파일명
  fileUrl   String   // Supabase Public URL
  fileSize  Int      // Bytes
  createdAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

## 🎨 UI 구성

### 관리자 페이지
- **파일 업로드 폼**:
  - 파일 선택 input
  - 파일 정보 표시 (크기)
  - 업로드 버튼
  - 로딩 상태 표시

- **파일 목록**:
  - 파일 아이콘
  - 파일명 (truncate)
  - 파일 크기, 업로드 날짜
  - 다운로드 / 삭제 버튼

### 학생 페이지
- **강의 상세 페이지**:
  - 강의 자료 카드
  - 파일 목록 (파일명, 크기)
  - 다운로드 버튼

- **수강 페이지**:
  - 사이드바 하단에 표시
  - 최소화된 파일 목록
  - 다운로드 아이콘

## ⚠️ 제한사항

### 현재 제한
1. **파일 크기**: 100MB (코드에서 변경 가능)
2. **파일 형식**: 제한 없음 (모든 형식 허용)
3. **다운로드 권한**: Public (누구나 URL 접근 가능)
4. **업로드 진행률**: 미표시 (로딩 상태만 표시)

### Supabase Free Tier 제한
- **Storage**: 1GB
- **Bandwidth**: 2GB/월
- 초과 시 Pro Plan 필요 ($25/월)

## 🚀 향후 개선 사항

### High Priority
1. **수강생만 다운로드 가능**:
   - Signed URL 사용
   - 권한 확인 API 추가

2. **업로드 진행률 표시**:
   - XMLHttpRequest 사용
   - Progress bar 추가

### Medium Priority
3. **파일 형식 제한**:
   - PDF, 문서, 압축 파일만 허용
   - MIME type 체크

4. **파일 미리보기**:
   - PDF 뷰어 추가
   - 이미지 미리보기

### Low Priority
5. **파일 압축**:
   - ZIP 자동 압축
   - 다운로드 최적화

6. **CDN 연동**:
   - Cloudflare 등 CDN 사용
   - 빠른 다운로드 속도

## 📚 관련 문서

- [Supabase Storage 설정 가이드](./supabase-storage-setup.md)
- [WBS - Phase 2.8](./wbs.md#28-관리자-강의-자료-관리-3-4일)

## ✅ 테스트 체크리스트

- [ ] Supabase 환경변수 설정
- [ ] `course-files` 버킷 생성
- [ ] 관리자 로그인
- [ ] 파일 업로드 (작은 파일)
- [ ] 파일 업로드 (큰 파일 - 100MB 이하)
- [ ] 파일 목록 표시 확인
- [ ] 파일 다운로드 (관리자)
- [ ] 파일 다운로드 (학생 - 상세 페이지)
- [ ] 파일 다운로드 (학생 - 수강 페이지)
- [ ] 파일 삭제
- [ ] Supabase Storage에서 파일 삭제 확인

## 🎉 완료!

강의 자료 업로드 기능이 완전히 구현되었습니다!
