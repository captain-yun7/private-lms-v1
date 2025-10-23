# Private LMS Template

외주 프로젝트용 개인 온라인 강의 사이트 템플릿입니다.

## 프로젝트 소개

이 템플릿은 개인 강사를 위한 온라인 강의 사이트를 빠르게 구축할 수 있도록 설계된 Next.js 기반 풀스택 프로젝트입니다. 각 클라이언트의 요구사항에 맞게 자유롭게 커스터마이징하여 사용할 수 있습니다.

## 주요 기능

### 회원 관리
- **다중 인증 방식**: 이메일/비밀번호, Google, Kakao, Naver 로그인
- **역할 기반 권한**: STUDENT, ADMIN 역할 구분
- **프로필 관리**: 회원 정보 수정, 프로필 이미지

### 강의 관리
- **강의 CRUD**: 강의 생성, 수정, 삭제, 공개/비공개 설정
- **비디오 관리**: Vimeo 연동 영상 업로드 및 관리
- **강의 자료**: 파일 업로드/다운로드 (Supabase Storage)
- **미리보기**: 특정 영상 미리보기 기능

### 결제 시스템
- **토스페이먼츠 연동**: 카드 결제, 무통장입금
- **구매 관리**: 결제 내역, 입금 승인/거절
- **영수증/세금계산서**: 자동 발행 및 관리
- **환불 처리**: 환불 신청 및 관리

### 수강 관리
- **진도율 추적**: 영상별 시청 위치 저장
- **완강 체크**: 영상 완료 여부 관리
- **기기 제한**: 최대 2개 기기에서만 시청 가능 (FingerprintJS)
- **기기 관리**: 등록된 기기 확인, 이름 변경, 삭제

### 커뮤니티
- **공지사항**: 관리자 공지 게시, 조회수 추적, 중요 공지 상단 고정
- **1:1 문의**: 비밀글 문의 및 답변 시스템

### 관리자 대시보드
- **통계 대시보드**: 매출, 회원, 수강 통계
- **회원 관리**: 회원 목록, 검색, 역할 변경
- **결제 관리**: 입금 승인, 환불 처리
- **컨텐츠 관리**: 강의, 영상, 공지사항 관리

## 기술 스택

### Frontend & Backend
- **Next.js 15** (App Router) - React 19 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **TailwindCSS 4** - 유틸리티 기반 스타일링

### Database & ORM
- **PostgreSQL** (Supabase) - 관계형 데이터베이스
- **Prisma** - 타입 세이프 ORM

### Authentication
- **NextAuth.js v5** - 통합 인증 솔루션
- **Credentials, OAuth** (Google, Kakao, Naver)

### Payment
- **토스페이먼츠** - 카드 결제, 무통장입금

### Video
- **Vimeo API** - 영상 업로드 및 스트리밍

### Storage
- **Supabase Storage** - 파일 업로드 및 관리

### Form & Validation
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### Rich Text Editor
- **TipTap** - WYSIWYG 에디터

### Device Fingerprinting
- **FingerprintJS** - 기기 고유 식별

## 📦 템플릿 버전 선택

이 저장소는 2가지 템플릿 버전을 제공합니다. 프로젝트 요구사항에 맞는 버전을 선택하세요.

### 🎯 버전 비교

| 항목 | v0.1.0-starter | v1.0.0-template |
|------|----------------|-----------------|
| **추천 대상** | 직접 기능 구현 원할 때 | 빠른 런칭 필요할 때 |
| **난이도** | 중급 | 초급~중급 |
| **개발 시간** | 2-4주 | 1-2주 |
| | | |
| **기본 구조** | ✅ | ✅ |
| Next.js 15 + TypeScript | ✅ | ✅ |
| TailwindCSS 4 | ✅ | ✅ |
| Prisma + Supabase | ✅ | ✅ |
| NextAuth.js v5 | ✅ | ✅ |
| 기본 페이지 (About, Contact) | ✅ | ✅ |
| LiveKlass 스타일 UI | ✅ | ✅ |
| | | |
| **LMS 기능** | ❌ | ✅ |
| 강의/영상 관리 | ❌ | ✅ |
| 결제 시스템 | ❌ | ✅ |
| 진도율 추적 | ❌ | ✅ |
| 기기 제한 | ❌ | ✅ |
| 관리자 대시보드 | ❌ | ✅ |
| 공지사항/문의 | ❌ | ✅ |

### 🚀 v0.1.0-starter (Starter Template)

**순수한 시작점 - 기본 인프라만 갖춘 템플릿**

```bash
git clone --branch v0.1.0-starter <저장소-URL> my-project
cd my-project
rm -rf .git
git init
git add .
git commit -m "feat: Initial commit from starter template v0.1.0"
```

**포함 내용:**
- ✅ Next.js 15 App Router 구조
- ✅ Prisma 스키마 (완전한 LMS 모델 포함, 사용은 선택)
- ✅ Supabase 연결 설정
- ✅ NextAuth.js 인증 (Google OAuth, 로그인/회원가입)
- ✅ 기본 페이지 (/, /about, /dashboard, /contact, /community)
- ✅ Header/Footer 컴포넌트
- ✅ 미들웨어 보호 라우트

**장점:**
- 깨끗한 코드베이스로 시작
- 원하는 기능만 선택적으로 구현
- Prisma 스키마 참고 가능

**적합한 경우:**
- LMS 기능을 직접 구현하고 싶을 때
- 프로젝트 구조와 UI만 활용하고 싶을 때
- 완전히 다른 기능을 만들고 싶을 때

---

### 🎓 v1.0.0-template (Full LMS Template)

**완성된 LMS - 모든 기능이 포함된 템플릿**

```bash
git clone --branch v1.0.0-template <저장소-URL> my-lms-project
cd my-lms-project
rm -rf .git
git init
git add .
git commit -m "feat: Initial commit from template v1.0.0"
```

**포함 내용:**
- ✅ **v0.1.0-starter의 모든 것 +**
- ✅ 강의/영상 관리 시스템 (Vimeo 연동)
- ✅ 결제 시스템 (토스페이먼츠, 무통장입금)
- ✅ 수강 진도율 관리
- ✅ 기기 제한 (FingerprintJS, 최대 2개)
- ✅ 관리자 대시보드 (통계, 회원/결제 관리)
- ✅ 공지사항, 1:1 문의 시스템
- ✅ 세금계산서, 환불 처리

**장점:**
- 즉시 배포 가능한 완성도
- 커스터마이징만으로 런칭 가능
- 모든 핵심 기능 구현됨

**적합한 경우:**
- 빠르게 LMS 사이트를 런칭하고 싶을 때
- 대부분의 기능이 필요할 때
- 브랜딩/디자인 변경만 하면 될 때

---

### 🔄 GitHub Template 사용 (모든 버전 공통)

1. GitHub 저장소 페이지에서 "Use this template" 버튼 클릭
2. 새 저장소 이름 입력 (예: `lms-client-john`)
3. Private로 설정 후 생성
4. 로컬에 클론
```bash
git clone <새-저장소-URL> my-lms-project
cd my-lms-project
```

> **참고:** GitHub Template 사용 시 기본적으로 `main` 브랜치 (최신 코드)가 클론됩니다.
> 특정 버전을 사용하려면 위의 태그 기준 복제 방법을 사용하세요.

## 초기 설정 가이드

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

필수 환경변수 설정:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="랜덤-시크릿-키"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (필요한 것만)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Vimeo
VIMEO_ACCESS_TOKEN="..."

# 토스페이먼츠
NEXT_PUBLIC_TOSS_CLIENT_KEY="..."
TOSS_SECRET_KEY="..."

# FingerprintJS
NEXT_PUBLIC_FINGERPRINT_PUBLIC_KEY="..."
```

### 3. 데이터베이스 설정

```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스에 스키마 적용
npx prisma db push

# (선택) 시드 데이터 삽입
npm run db:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 5. 첫 관리자 계정 생성

회원가입 후 데이터베이스에서 직접 role을 ADMIN으로 변경하거나, Prisma Studio 사용:

```bash
npx prisma studio
```

## 커스터마이징 가이드

### 브랜딩 변경

1. **사이트 제목 및 메타데이터**
   - `src/app/layout.tsx` - metadata 수정

2. **로고 및 파비콘**
   - `public/` 폴더에 로고 이미지 추가
   - `src/components/Header.tsx` - 로고 변경

3. **색상 테마**
   - `tailwind.config.ts` - primary, secondary 색상 수정

4. **Footer 정보**
   - `src/components/Footer.tsx` - 회사 정보, 연락처 수정

### 기능 추가/제거

1. **인증 방식 변경**
   - `auth.ts` - providers 추가/제거
   - OAuth 제거 시 환경변수도 제거

2. **결제 방식 변경**
   - 토스페이먼츠 외 다른 PG사 연동 시 `src/app/api/payment/` 수정

3. **기기 제한 수 변경**
   - `src/app/mypage/devices/page.tsx` - `canRegisterNewDevice` 로직 수정
   - `src/app/api/devices/route.ts` - deviceCount >= 2 부분 수정

4. **Prisma 스키마 수정**
   - `prisma/schema.prisma` 수정 후
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### package.json 수정

새 프로젝트 시작 시 꼭 수정하세요:

```json
{
  "name": "my-lms-project",  // 프로젝트명 변경
  "version": "0.1.0",        // 버전 초기화
  "private": true
}
```

## 프로젝트 구조

```
private-lms-v1/
├── prisma/
│   ├── schema.prisma          # 데이터베이스 스키마
│   └── seed.ts                # 시드 데이터
├── public/                    # 정적 파일
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # 인증 관련 페이지
│   │   ├── admin/            # 관리자 대시보드
│   │   ├── api/              # API Routes
│   │   ├── courses/          # 강의 페이지
│   │   ├── mypage/           # 마이페이지
│   │   └── ...
│   ├── components/           # 재사용 컴포넌트
│   ├── hooks/                # 커스텀 훅
│   ├── lib/                  # 유틸리티 함수
│   │   ├── prisma.ts        # Prisma Client
│   │   ├── supabase.ts      # Supabase Client
│   │   └── ...
│   └── middleware.ts         # Next.js 미들웨어 (인증 보호)
├── .env                      # 환경변수 (git 무시)
├── .env.example              # 환경변수 예시
├── auth.ts                   # NextAuth 설정
└── package.json
```

## 주요 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 번들 크기 분석
npm run analyze

# Prisma 명령어
npm run db:generate    # Prisma Client 생성
npm run db:push        # 스키마를 DB에 적용
npm run db:seed        # 시드 데이터 삽입
```

## 배포

### Vercel (권장)

1. Vercel에 GitHub 저장소 연결
2. 환경변수 설정 (Vercel Dashboard)
3. 자동 배포

### 기타 플랫폼

- **환경변수**: `.env`의 모든 변수를 플랫폼에 설정
- **빌드 명령어**: `npm run build`
- **시작 명령어**: `npm run start`
- **Node 버전**: 18.x 이상

## 보안 주의사항

1. **환경변수 절대 노출 금지**
   - `.env` 파일을 git에 커밋하지 마세요
   - API 키를 클라이언트 코드에 직접 넣지 마세요

2. **관리자 권한 보호**
   - 첫 관리자는 수동으로 DB에서 설정
   - 관리자 라우트는 미들웨어로 보호됨

3. **Prisma 마이그레이션**
   - 프로덕션에서는 `db push` 대신 `migrate deploy` 사용 권장

## 라이센스

이 템플릿은 외주 프로젝트용으로 제공되며, 각 클라이언트 프로젝트는 독립적으로 관리됩니다.

## 버전 히스토리

### v1.0.0-template (2025-10-23)
**완성된 LMS 템플릿**
- 회원 관리, 강의 관리, 결제, 기기 제한
- 관리자 대시보드, 공지사항, 1:1 문의
- 세금계산서, 환불 처리
- 모든 핵심 기능 구현 완료

### v0.1.0-starter (2025-10-20)
**기본 인프라 템플릿**
- Next.js 15 + Prisma + Supabase 초기 구조
- NextAuth.js v5 인증 시스템
- LiveKlass 스타일 UI
- 기본 페이지 구조 (About, Dashboard, Contact, Community)

## 문제 해결

### Prisma 관련 오류
```bash
# Prisma Client 재생성
npx prisma generate

# 데이터베이스 리셋 (개발 환경에서만!)
npx prisma db push --force-reset
```

### 인증 오류
- `NEXTAUTH_SECRET`이 설정되어 있는지 확인
- `NEXTAUTH_URL`이 현재 도메인과 일치하는지 확인

### 기기 목록 조회 오류
- `/mypage` 경로가 미들웨어에서 보호되는지 확인
- 로그인 상태 확인

---

템플릿 사용 중 문제가 발생하면 Prisma 스키마와 환경변수 설정을 먼저 확인하세요.
