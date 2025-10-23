# Work Breakdown Structure (WBS)

## 1. 프로젝트 개요

### 프로젝트명
Private LMS (개인 온라인 강의 사이트)

### 전체 기간
**12주 ~ 18주 (약 3개월 ~ 4.5개월)**

### 개발 방식
- 1인 개발
- Agile 방식 (Phase별 반복 개발)
- MVP 우선, 점진적 기능 추가

---

## 2. Phase별 작업 분류

### Phase 1: 기본 인프라 (1-2주)

#### 목표
프로젝트 초기 설정 및 인증 시스템 구축

#### 작업 목록

**1.1 프로젝트 초기 설정 (2일)**
- [x] Next.js 15 프로젝트 생성
- [x] TypeScript 설정
- [x] TailwindCSS 설정 (v4)
- [x] ESLint, Prettier 설정
- [x] Git 저장소 초기화
- [x] .gitignore 설정
- [ ] 환경 변수 설정 (.env.local) - 부분 완료 (설정 필요)

**1.2 데이터베이스 설정 (2일)**
- [x] Supabase 프로젝트 생성
- [x] Prisma 설치 및 초기 설정
- [ ] DATABASE_URL 환경 변수 설정 (환경변수 파일 생성 필요)
- [x] Prisma 스키마 작성 (User, Account, Session, VerificationToken + 전체 모델)
- [x] 첫 마이그레이션 실행 (`npx prisma migrate dev --name init`)
- [x] Prisma Client 생성
- [x] Prisma Studio 확인

**1.3 NextAuth.js 설정 (3-4일)**
- [x] NextAuth.js v5 설치
- [x] Prisma Adapter 설정
- [x] Credentials Provider 구현 (일반 로그인)
  - [x] bcrypt 설치 및 비밀번호 해싱
  - [x] 로그인 로직 구현
- [x] Google Provider 설정
  - [ ] Google Cloud Console에서 OAuth 클라이언트 생성 (환경변수 설정 필요)
  - [ ] 환경 변수 설정
- [x] Kakao Provider 설정
  - [ ] Kakao Developers에서 앱 생성 (환경변수 설정 필요)
  - [ ] 환경 변수 설정
- [x] Naver Provider 설정
  - [ ] Naver Developers에서 앱 생성 (환경변수 설정 필요)
  - [ ] 환경 변수 설정
- [x] NextAuth API Routes 설정
- [x] Session 관리 (JWT 또는 DB Session)

**1.4 기본 UI/레이아웃 (2-3일)**
- [x] 공통 레이아웃 컴포넌트 (Header, Footer)
- [x] 네비게이션 메뉴
  - [x] 소개, 강의, 커뮤니티, 고객센터, 마이페이지
  - [x] 로그인/로그아웃 버튼
- [x] Shadcn/ui 설치 (선택적) 또는 커스텀 UI 컴포넌트 - Tailwind 기반 커스텀 UI
- [x] 반응형 디자인 기본 설정

**1.5 인증 페이지 (2-3일)**
- [x] 로그인 페이지
  - [x] 이메일/비밀번호 로그인 폼
  - [x] 소셜 로그인 버튼 (Google, Kakao, Naver)
  - [x] 로그인 에러 처리
- [x] 회원가입 페이지
  - [x] 회원가입 폼 (이름, 이메일, 비밀번호)
  - [x] 유효성 검사 (React Hook Form + Zod)
  - [x] 이메일 중복 검사
  - [x] 비밀번호 강도 체크
  - [x] 회원가입 성공 시 자동 로그인
- [ ] 비밀번호 찾기 페이지 (선택적)

**1.6 테스트 (1일)**
- [ ] 4가지 로그인 방식 테스트 (환경변수 설정 후 테스트 필요)
- [x] 회원가입 테스트 (Credentials 방식)
- [ ] 세션 유지 테스트
- [ ] 로그아웃 테스트

#### Deliverable
- [x] 4가지 로그인 방식 코드 구현 완료 (환경변수 설정만 필요)
- [x] 기본 레이아웃 완성 (LiveKlass 스타일)
- [x] 데이터베이스 연결 완료
- [ ] 환경변수 파일 설정 및 소셜 로그인 테스트 필요

---

### Phase 2: 핵심 강의 기능 (3-4주)

#### 목표
강의 목록, 상세, 수강 페이지 구현 및 관리자 강의 관리 기능

#### 작업 목록

**2.1 데이터베이스 스키마 확장 (1일)**
- [x] Course, Video, CourseFile 모델 추가 (전체 스키마 작성 완료)
- [x] 마이그레이션 실행
- [x] Seed 데이터 작성 (테스트용 강의, 영상)

**2.2 강의 목록 페이지 (3-4일)**
- [x] 강의 목록 조회 API (`/api/courses`) - 완료 (스키마 수정 완료)
- [x] 강의 목록 페이지 UI (`/courses`) - API 연결 완료
  - [x] 강의 카드 컴포넌트
  - [x] 그리드 레이아웃
  - [x] 반응형 디자인
- [x] 검색 기능
  - [x] 제목/설명/강사명 검색
  - [x] 검색 결과 표시
- [x] 정렬 기능 (최신순, 인기순, 가격순)
- [ ] 페이지네이션 또는 무한 스크롤 (선택적)
- [x] 로딩 상태 표시
- [x] 에러 처리

**2.3 강의 상세 페이지 (4-5일)**
- [x] 강의 상세 조회 API (`/api/courses/[id]`) - 완료 (스키마 수정 완료)
- [x] 강의 상세 페이지 UI (`/courses/[id]`) - API 연결 완료
  - [x] 강의 정보 표시 (제목, 설명, 가격, 강사)
  - [x] 영상 목록 표시 (제목, 재생 시간, 미리보기 여부)
  - [x] 강의 자료 목록 표시
  - [x] 구매 버튼
  - [x] 이미 구매한 경우 "학습 시작하기" 버튼 표시
- [ ] Vimeo 미리보기 영상 플레이어
  - [ ] Vimeo Player SDK 설치 및 설정
  - [ ] 미리보기 영상 임베드
  - [ ] 재생 제어
- [x] 구매 여부 확인 로직 (isEnrolled)
- [ ] 로그인하지 않은 경우 로그인 페이지로 리디렉션

**2.4 강의 수강 페이지 (5-6일)**
- [ ] 수강 권한 확인 Middleware 또는 서버 컴포넌트
- [ ] 강의 수강 페이지 UI (`/courses/[id]/learn`)
  - [ ] Vimeo 영상 플레이어 (메인)
  - [ ] 영상 목록 사이드바
  - [ ] 현재 영상 정보 표시
  - [ ] 이전/다음 영상 버튼
- [ ] Vimeo Player SDK 고급 기능
  - [ ] 재생 속도 조절
  - [ ] 화질 선택
  - [ ] 전체화면
  - [ ] 우클릭 방지 (선택적)
- [ ] 영상 전환 기능 (클릭 시 해당 영상 재생)
- [ ] 강의 자료 다운로드 섹션 (기본 UI, 다운로드 기능은 Phase 4)
- [ ] 로딩 상태, 에러 처리

**2.5 관리자 페이지 기본 구조 (2일)**
- [ ] 관리자 전용 레이아웃 (`/admin`)
- [ ] 관리자 권한 확인 Middleware
- [ ] 관리자 사이드바 메뉴
  - [ ] 강의 관리, 학생 관리, 결제 관리, 콘텐츠 관리, 통계
- [ ] 일반 사용자 접근 차단 (403 또는 리디렉션)

**2.6 관리자: 강의 관리 (5-6일)**
- [ ] 강의 목록 페이지 (`/admin/courses`)
  - [ ] 전체 강의 목록 조회
  - [ ] 검색/필터링 (공개/비공개)
  - [ ] "강의 추가" 버튼
  - [ ] 각 강의별 "수정", "삭제" 버튼
- [ ] 강의 생성 페이지 (`/admin/courses/new`)
  - [ ] 강의 정보 입력 폼
  - [ ] 썸네일 이미지 업로드 (Supabase Storage)
  - [ ] 공개/비공개 설정
  - [ ] 저장 API (`POST /api/admin/courses`)
- [ ] 강의 수정 페이지 (`/admin/courses/[id]/edit`)
  - [ ] 기존 강의 정보 불러오기
  - [ ] 수정 폼
  - [ ] 수정 API (`PATCH /api/admin/courses/[id]`)
- [ ] 강의 삭제 API (`DELETE /api/admin/courses/[id]`)
  - [ ] 삭제 확인 다이얼로그
  - [ ] Soft delete 또는 Hard delete

**2.7 관리자: 영상 관리 (5-6일)**
- [ ] 영상 관리 페이지 (`/admin/courses/[id]/videos`)
  - [ ] 해당 강의의 영상 목록
  - [ ] "영상 추가" 버튼
  - [ ] 영상별 "수정", "삭제" 버튼
  - [ ] 순서 변경 (드래그 앤 드롭 또는 위/아래 버튼)
- [ ] 영상 추가 폼
  - [ ] Vimeo URL 입력
  - [ ] 영상 제목, 설명 입력
  - [ ] 미리보기 영상 체크박스
  - [ ] 저장 API (`POST /api/admin/courses/[id]/videos`)
- [ ] Vimeo API 연동 (선택적)
  - [ ] Vimeo URL에서 영상 ID 추출
  - [ ] Vimeo API로 영상 정보 가져오기 (제목, 재생 시간, 썸네일)
- [ ] 영상 순서 변경 API (`PATCH /api/admin/courses/[id]/videos/reorder`)
- [ ] 영상 삭제 API (`DELETE /api/admin/videos/[id]`)
- [ ] 미리보기 영상 지정/해제

**2.8 관리자: 강의 자료 관리 (3-4일)**
- [ ] 강의 자료 관리 페이지 (`/admin/courses/[id]/files`)
  - [ ] 해당 강의의 자료 목록
  - [ ] "파일 업로드" 버튼
  - [ ] 파일별 "삭제" 버튼
- [ ] 파일 업로드
  - [ ] Supabase Storage 연동
  - [ ] 파일 업로드 API (`POST /api/admin/courses/[id]/files`)
  - [ ] 업로드 진행률 표시 (선택적)
- [ ] 파일 삭제 API (`DELETE /api/admin/files/[id]`)
  - [ ] Supabase Storage에서 파일 삭제
  - [ ] DB 레코드 삭제

**2.9 테스트 (2일)**
- [ ] 강의 목록 조회 테스트
- [ ] 강의 상세 조회 테스트
- [ ] 미리보기 영상 재생 테스트
- [ ] 강의 수강 페이지 테스트 (구매자)
- [ ] 관리자: 강의 CRUD 테스트
- [ ] 관리자: 영상 관리 테스트
- [ ] 관리자: 강의 자료 관리 테스트

#### Deliverable
- 사용자: 강의 목록/상세 조회, 미리보기 시청
- 관리자: 강의/영상/자료 관리 기능
- Vimeo 연동 완료

---

### Phase 3: 결제 시스템 (2-3주) ✅ **완료**

#### 목표
토스페이먼츠 카드 결제, 무통장입금, 영수증, 환불 기능 구현

#### 작업 목록

**3.1 데이터베이스 스키마 확장 (1일)**
- [x] Purchase, Payment, BankTransfer, Receipt, TaxInvoice, Refund 모델 추가
- [x] 마이그레이션 실행

**3.2 토스페이먼츠 연동 준비 (1일)**
- [x] 토스페이먼츠 가입 및 테스트 키 발급
- [x] 환경 변수 설정 (클라이언트 키, 시크릿 키)
- [x] `@tosspayments/payment-widget-sdk` 설치

**3.3 결제 페이지 (3-4일)**
- [x] 결제 페이지 UI (`/checkout/[courseId]`)
  - [x] 강의 정보 요약
  - [x] 결제 수단 선택 (카드/무통장입금)
  - [x] 구매자 정보 입력 (이름, 이메일, 전화번호)
  - [x] 구매 동의 체크박스
  - [x] "결제하기" 버튼 (카드)
  - [x] "입금 정보 제출" 버튼 (무통장입금)
- [x] 결제 수단별 UI 토글
- [x] 유효성 검사

**3.4 카드 결제 (토스페이먼츠) (4-5일)**
- [x] 결제 요청 API (`POST /api/payments/request`)
  - [x] Purchase 레코드 생성 (status: PENDING)
  - [x] Payment 레코드 생성
  - [x] orderId 생성 (UUID)
  - [x] 클라이언트에 결제 정보 반환
- [x] 토스페이먼츠 결제창 호출
  - [x] 클라이언트에서 토스페이먼츠 Widget SDK 사용
  - [x] 결제창 띄우기 (카드, 간편결제, 카카오페이, 네이버페이 지원)
- [x] 결제 성공 콜백 처리 (`/checkout/success`)
  - [x] 쿼리 파라미터에서 paymentKey, orderId, amount 추출
  - [x] 결제 승인 API (`POST /api/payments/confirm`)
    - [x] 토스페이먼츠 API로 결제 승인 요청
    - [x] Payment 상태 "COMPLETED"로 변경
    - [x] Purchase 상태 "COMPLETED"로 변경
    - [x] Enrollment 생성 (수강 등록) - 중복 방지 로직 포함
    - [x] Receipt 생성 (영수증) - 중복 방지 로직 포함
  - [x] 결제 완료 페이지 표시
- [x] 결제 실패 콜백 처리 (`/checkout/fail`)
  - [x] 실패 사유 표시
  - [x] 결제 페이지로 복귀 버튼

**3.5 무통장입금 (3-4일)**
- [x] 무통장입금 정보 입력 폼
  - [x] 입금자명
  - [x] 입금 예정일
- [x] 무통장입금 요청 API (`POST /api/payments/bank-transfer`)
  - [x] Purchase 생성 (status: PENDING)
  - [x] Payment 생성 (method: BANK_TRANSFER, status: PENDING)
  - [x] BankTransfer 생성
  - [x] 입금 대기 상태로 저장
- [x] 입금 대기 안내 페이지 (`/checkout/bank-transfer-pending`)
  - [x] 입금 계좌 정보 표시
  - [x] 입금자명 확인
  - [x] 관리자 승인 안내

**3.6 관리자: 무통장입금 관리 (3일)**
- [x] 무통장입금 관리 페이지 (`/admin/payments/bank-transfers`)
  - [x] 입금 대기 목록 조회
  - [x] 각 항목별 "승인", "거절" 버튼
- [x] 입금 승인 API (`POST /api/admin/payments/bank-transfers/[id]/approve`)
  - [x] Payment 상태 "COMPLETED"로 변경
  - [x] Purchase 상태 "COMPLETED"로 변경
  - [x] BankTransfer.approvedAt 설정
  - [x] Enrollment 생성 (수강 등록)
  - [x] Receipt 생성
  - [ ] 사용자 알림 (이메일 - 선택적, 미구현)
- [x] 입금 거절 API (`POST /api/admin/payments/bank-transfers/[id]/reject`)
  - [x] 거절 사유 입력
  - [x] Payment 상태 "CANCELED"로 변경
  - [x] BankTransfer.rejectedAt, rejectReason 설정
  - [ ] 사용자 알림 (선택적, 미구현)

**3.7 영수증 (2-3일)**
- [x] 영수증 조회 페이지 (`/receipts/[id]`)
  - [x] 영수증 정보 표시
  - [x] 인쇄 버튼
  - [ ] PDF 다운로드 버튼 (선택적 - 미구현)
- [x] 영수증 조회 API (`GET /api/receipts/[id]`)
- [ ] PDF 생성 (선택적 - 미구현)
  - [ ] react-pdf 또는 puppeteer 사용
  - [ ] 영수증 템플릿 디자인

**3.8 환불 (3-4일)**
- [x] 환불 신청 페이지 (`/refunds/request/[purchaseId]`)
  - [x] 환불 사유 입력 (최소 10자)
  - [x] 환불 계좌 정보 입력 (무통장입금용)
  - [x] 환불 신청 API (`POST /api/refunds`)
    - [x] Refund 레코드 생성 (status: PENDING)
    - [x] **환불 정책 검사: 7일 이내 + 진도율 10% 미만**
- [x] 관리자: 환불 관리 페이지 (`/admin/refunds`)
  - [x] 환불 신청 목록
  - [x] 상태별 필터링 (ALL, PENDING, COMPLETED, REJECTED)
  - [x] 각 항목별 "승인", "거절" 버튼
- [x] 환불 승인 API (`POST /api/admin/refunds/[id]/approve`)
  - [x] 카드 결제: 토스페이먼츠 결제 취소 API 호출
  - [x] 무통장입금: 수동 환불 처리 안내
  - [x] **1년 경과 체크: TossPayments API 제한 확인**
  - [x] Refund 상태 "COMPLETED"로 변경
  - [x] Purchase 상태 "REFUNDED"로 변경
  - [x] Enrollment 삭제
  - [x] Progress 삭제
  - [ ] 사용자 알림 (선택적, 미구현)
- [x] 환불 거절 API (`POST /api/admin/refunds/[id]/reject`)
  - [x] 거절 사유 입력 (최소 10자)
  - [x] Refund 상태 "REJECTED"로 변경
  - [ ] 사용자 알림 (선택적, 미구현)

**3.9 마이페이지: 결제 내역 (2-3일)**
- [x] 결제 내역 페이지 (`/mypage/payments`)
  - [x] 구매한 강의 목록
  - [x] 결제 정보 (날짜, 금액, 수단, 상태)
  - [x] 영수증 조회 버튼
  - [x] 환불 신청 버튼 (가능한 경우)
  - [x] 환불 상태 표시
- [x] 결제 내역 조회 API (`GET /api/mypage/payments`)
- [ ] 필터링 (결제 상태별 - 선택적, 미구현)

**3.10 테스트 (2일)**
- [x] 카드 결제 테스트 (토스페이먼츠 테스트 키)
- [x] 카카오페이 결제 테스트
- [ ] 무통장입금 테스트 (미완료)
- [ ] 관리자: 입금 승인/거절 테스트 (미완료)
- [x] 영수증 조회/출력 테스트
- [x] 환불 신청/승인/거절 테스트
- [x] 결제 후 수강 등록 확인
- [x] 환불 정책 테스트 (7일 + 10%)

#### Deliverable
- [x] 카드 결제 및 무통장입금 기능
- [x] 결제 후 강의 수강 가능
- [x] 영수증 발급 및 조회
- [x] 환불 시스템 (신청/승인/거절)
- [x] 환불 정책 (7일 + 10%) 구현
- [x] TossPayments Widget SDK 연동 완료
- [x] NextAuth v5 호환성 확보

#### 추가 구현 사항
- [x] 결제 안정성 개선 (Enrollment/Receipt 중복 방지)
- [x] 관리자 계정 결제 시 실제 구매자에게 수강 등록
- [x] 환불 정책 문서화 (7일 + 10% 제한, 관리자 1년 제한)
- [x] TossPayments 테스트 모드 안전성 가이드
- [x] Phase 3 테스트 가이드 작성
- [x] 테스트 스크립트 작성 (`scripts/test-phase3.sh`)

---

### Phase 4: 진도율 및 학습 관리 (1-2주) ✅ **완료**

#### 목표
진도율 추적, 이어보기, 강의 자료 다운로드 기능 구현

#### 작업 목록

**4.1 데이터베이스 스키마 확장 (1일)**
- [x] Enrollment, Progress 모델 추가 (Phase 3에서 구현됨)
- [x] 마이그레이션 실행

**4.2 진도율 시스템 (4-5일)**
- [x] Vimeo Player API 이벤트 리스너 설정
  - [x] `timeupdate`: 재생 시간 추적 (5초마다 저장)
  - [x] `ended`: 영상 종료 이벤트
- [x] 재생 위치 저장 API (`POST /api/progress`)
  - [x] 주기적으로 현재 재생 위치 저장 (5초마다)
  - [x] Progress 레코드 upsert (없으면 생성, 있으면 업데이트)
  - [x] lastPosition 업데이트
- [x] 완료 처리 로직
  - [x] 영상 90% 이상 시청 시 isCompleted = true
  - [x] completedAt 설정
- [x] 진도율 조회 API (`GET /api/progress?courseId=xxx`)
  - [x] 전체 영상 수
  - [x] 완료한 영상 수
  - [x] 진도율 퍼센트 계산
  - [x] 각 영상별 진도율 정보

**4.3 이어보기 기능 (2일)**
- [x] 영상 재생 시 마지막 시청 위치 불러오기
- [x] Vimeo Player에서 마지막 위치로 이동 (`player.setCurrentTime()`)
- [ ] "이어보기" 또는 "처음부터" 선택 옵션 (선택적 - 미구현)

**4.4 강의 수강 페이지 진도율 표시 (2일)**
- [x] 전체 진도율 표시 (진행 바 + 퍼센트) - 상단 네비게이션에 표시
- [x] 영상 목록에서 완료한 영상 체크 아이콘 표시
- [ ] 현재 영상 진도율 표시 (선택적 - 미구현)

**4.5 마이페이지: 내 강의실 (3-4일)**
- [x] 대시보드 페이지 (`/dashboard`) - 내 강의실 역할
  - [x] 수강 중인 강의 목록
  - [x] 각 강의별 진도율 표시 (진행 바 + 퍼센트)
  - [x] 완료한 영상 수 / 전체 영상 수
  - [x] 총 학습 시간, 완료한 강의 수 등 통계
  - [x] "수강하기" 버튼
- [x] 서버 컴포넌트로 데이터 직접 조회
  - [x] Enrollment 조회
  - [x] 각 강의별 진도율 계산
  - [x] 통계 정보 계산

**4.6 강의 자료 다운로드 (2-3일)**
- [x] 강의 상세 페이지에서 자료 목록 표시 (Phase 2에서 구현됨)
- [x] 강의 수강 페이지에서 자료 다운로드 섹션 추가
- [x] 다운로드 권한 확인 (구매자만)
- [x] 파일 다운로드 API (`GET /api/courses/[id]/files/[fileId]/download`)
  - [x] Enrollment 확인 (수강 권한 검증)
  - [x] Supabase Storage URL 반환
- [x] 다운로드 버튼 클릭 시 파일 다운로드 (download 속성 사용)

**4.7 테스트 (1-2일)**
- [x] 영상 시청 시 진도율 저장 테스트
- [x] 완료 처리 테스트 (90% 이상 시청)
- [x] 이어보기 기능 테스트
- [x] 대시보드 진도율 표시 테스트
- [x] 강의 자료 다운로드 테스트

#### Deliverable
- [x] 진도율 추적 및 표시
- [x] 이어보기 기능
- [x] 내 강의실 (대시보드) 완성
- [x] 강의 자료 다운로드
- [x] 강의 수강 페이지 전체 진도율 표시

#### 추가 구현 사항
- [x] 5초마다 자동 저장 (중복 저장 방지 로직 포함)
- [x] 영상 90% 이상 시청 시 자동 완료 처리
- [x] 강의 목록에서 완료한 영상 체크 아이콘 표시
- [x] 강의 자료 다운로드 UI 개선 (hover 효과, 다운로드 아이콘)

---

### Phase 5: 부가 기능 (2-3주)

#### 목표
등록기기 관리, 공지사항, 1:1 문의, 세금계산서 기능 구현

#### 작업 목록

**5.1 등록기기 관리 (4-5일)**
- [ ] 데이터베이스 스키마: Device 모델 추가 (이미 추가되었을 수 있음)
- [ ] FingerprintJS 설치 및 설정
  - [ ] `@fingerprintjs/fingerprintjs` 설치
  - [ ] 클라이언트에서 기기 ID 생성
- [ ] 기기 등록 API (`POST /api/devices`)
  - [ ] 강의 수강 페이지 접속 시 자동 호출
  - [ ] 사용자의 등록 기기 수 확인
  - [ ] 2개 미만: 새 기기 등록
  - [ ] 2개 이상: 에러 반환 (접근 차단)
- [ ] 접근 차단 처리
  - [ ] 기기 초과 시 안내 페이지 표시
  - [ ] 기존 기기 목록 표시
  - [ ] 마이페이지로 이동 안내
- [ ] 마이페이지: 등록기기 관리 (`/mypage/devices`)
  - [ ] 등록된 기기 목록 조회 API (`GET /api/users/me/devices`)
  - [ ] 각 기기 정보 표시 (기기명, 등록일, 마지막 접속일)
  - [ ] 기기 해제 API (`DELETE /api/devices/[id]`)
  - [ ] 현재 기기 하이라이트
- [ ] 관리자: 기기 관리
  - [ ] 사용자별 등록 기기 조회 (`/admin/users/[id]/devices`)
  - [ ] 관리자 강제 해제 API (`DELETE /api/admin/devices/[id]`)

**5.2 공지사항 (4-5일)**
- [ ] 데이터베이스 스키마: Notice 모델 추가
- [ ] 공지사항 목록 페이지 (`/notices`)
  - [ ] 공지사항 목록 조회 API (`GET /api/notices`)
  - [ ] 중요 공지 상단 고정
  - [ ] 페이지네이션
- [ ] 공지사항 상세 페이지 (`/notices/[id]`)
  - [ ] 공지사항 상세 조회 API (`GET /api/notices/[id]`)
  - [ ] 조회수 증가
  - [ ] 첨부파일 다운로드
- [ ] 관리자: 공지사항 관리 (`/admin/notices`)
  - [ ] 공지사항 목록
  - [ ] "공지사항 작성" 버튼
- [ ] 관리자: 공지사항 작성 (`/admin/notices/new`)
  - [ ] 제목, 내용 입력 (Rich Text 에디터 - 선택적)
  - [ ] 첨부파일 업로드 (Supabase Storage)
  - [ ] 중요 공지 체크박스
  - [ ] 작성 API (`POST /api/admin/notices`)
- [ ] 관리자: 공지사항 수정 (`/admin/notices/[id]/edit`)
  - [ ] 수정 API (`PATCH /api/admin/notices/[id]`)
- [ ] 관리자: 공지사항 삭제
  - [ ] 삭제 API (`DELETE /api/admin/notices/[id]`)

**5.3 1:1 문의 (Tiptap) (5-6일)**
- [ ] 데이터베이스 스키마: Inquiry, InquiryReply 모델 추가
- [ ] Tiptap 설치 및 설정
  - [ ] `@tiptap/react`, `@tiptap/starter-kit` 설치
  - [ ] 기본 에디터 컴포넌트 생성
  - [ ] 이미지 업로드 기능 추가
- [ ] 사용자: 문의 작성 페이지 (`/inquiries/new`)
  - [ ] 제목 입력
  - [ ] Tiptap 에디터 (내용 입력)
  - [ ] 이미지 업로드 (Supabase Storage)
  - [ ] 비밀글 체크박스
  - [ ] 문의 작성 API (`POST /api/inquiries`)
- [ ] 사용자: 문의 목록 페이지 (`/mypage/inquiries`)
  - [ ] 내 문의 목록 조회 API (`GET /api/users/me/inquiries`)
  - [ ] 제목, 작성일, 답변 상태
- [ ] 사용자: 문의 상세 페이지 (`/inquiries/[id]`)
  - [ ] 문의 상세 조회 API (`GET /api/inquiries/[id]`)
  - [ ] 문의 내용 (Rich Text 렌더링)
  - [ ] 관리자 답변 표시
  - [ ] 수정/삭제 버튼 (답변 전)
- [ ] 관리자: 문의 관리 (`/admin/inquiries`)
  - [ ] 전체 문의 목록 조회 API (`GET /api/admin/inquiries`)
  - [ ] 필터링 (답변 상태)
  - [ ] 각 문의 클릭 → 상세 페이지
- [ ] 관리자: 문의 상세 및 답변 (`/admin/inquiries/[id]`)
  - [ ] 문의 내용 표시
  - [ ] Tiptap 에디터 (답변 작성)
  - [ ] 이미지 업로드
  - [ ] 답변 등록 API (`POST /api/admin/inquiries/[id]/reply`)
    - [ ] InquiryReply 생성
    - [ ] Inquiry 상태 "ANSWERED"로 변경
  - [ ] 답변 수정/삭제 API

**5.4 세금계산서 발급 (3-4일)**
- [ ] 데이터베이스 스키마: TaxInvoice 모델 추가 (이미 Phase 3에서 추가)
- [ ] 마이페이지: 세금계산서 발급 요청 (`/mypage/payments/[purchaseId]/tax-invoice`)
  - [ ] 사업자 정보 입력 폼
  - [ ] 발급 요청 API (`POST /api/tax-invoices`)
    - [ ] TaxInvoice 레코드 생성 (status: REQUESTED)
- [ ] 관리자: 세금계산서 관리 (`/admin/tax-invoices`)
  - [ ] 발급 요청 목록 조회
  - [ ] 각 요청 상세 정보
  - [ ] "발행" 버튼
- [ ] 관리자: 세금계산서 발행
  - [ ] 발행 처리 API (`POST /api/admin/tax-invoices/[id]/issue`)
    - [ ] TaxInvoice 상태 "ISSUED"로 변경
    - [ ] issuedAt 설정
  - [ ] 수동 발행 안내 (회계 프로그램 사용)
  - [ ] 또는 API 연동 (선택적 - 더존, 세무서 API)
- [ ] 사용자: 세금계산서 조회/다운로드
  - [ ] 마이페이지 결제 내역에서 조회
  - [ ] PDF 다운로드 (선택적)

**5.5 테스트 (2일)**
- [ ] 등록기기 등록/제한 테스트
- [ ] 기기 해제 테스트
- [ ] 공지사항 CRUD 테스트
- [ ] 1:1 문의 작성/답변 테스트
- [ ] Tiptap 이미지 업로드 테스트
- [ ] 세금계산서 발급 요청/발행 테스트

#### Deliverable
- 등록기기 관리 완료
- 공지사항 기능
- 1:1 문의 기능 (리치 텍스트)
- 세금계산서 발급

---

### Phase 6: 관리자 고도화 (2주)

#### 목표
회원 관리, 결제 관리 강화, 통계/리포트 대시보드 구현

#### 작업 목록

**6.1 관리자: 회원 관리 (4-5일)**
- [ ] 회원 목록 페이지 (`/admin/users`)
  - [ ] 전체 회원 목록 조회 API (`GET /api/admin/users`)
  - [ ] 검색 (이름, 이메일)
  - [ ] 필터링 (가입 방법, 회원 상태)
  - [ ] 정렬 (가입일, 이름)
  - [ ] 페이지네이션
- [ ] 회원 상세 페이지 (`/admin/users/[id]`)
  - [ ] 회원 정보 조회 API (`GET /api/admin/users/[id]`)
  - [ ] 프로필 정보
  - [ ] 가입일, 가입 방법
  - [ ] 수강 현황 (구매한 강의, 진도율)
  - [ ] 결제 내역
  - [ ] 등록 기기 목록
- [ ] 회원 상태 관리
  - [ ] 회원 정지 API (`POST /api/admin/users/[id]/suspend`)
    - [ ] 정지 사유 입력
    - [ ] User 상태 변경 (선택적 - status 필드 추가)
  - [ ] 회원 정지 해제 API (`POST /api/admin/users/[id]/unsuspend`)
  - [ ] 회원 삭제 (탈퇴 처리) API (`DELETE /api/admin/users/[id]`)
- [ ] 등록 기기 조회 및 해제 (Phase 5에서 일부 구현)

**6.2 관리자: 결제 관리 강화 (3-4일)**
- [ ] 전체 결제 내역 페이지 (`/admin/payments`)
  - [ ] 전체 결제 내역 조회 API (`GET /api/admin/payments`)
  - [ ] 필터링 (결제 수단, 결제 상태, 날짜 범위)
  - [ ] 정렬 (결제일, 금액)
  - [ ] 페이지네이션
  - [ ] 통계 요약 (총 결제 건수, 총 결제 금액)
- [ ] 결제 상세 정보 모달 또는 페이지
  - [ ] 학생 정보, 강의 정보, 결제 정보
- [ ] 무통장입금 관리 UI 개선 (Phase 3에서 기본 구현)
  - [ ] 입금 대기 알림 배지
  - [ ] 빠른 승인/거절 버튼
- [ ] 환불 관리 UI 개선 (Phase 3에서 기본 구현)
  - [ ] 환불 신청 알림 배지
  - [ ] 환불 정책 자동 확인 (진도율, 수강 시작일 등)

**6.3 테스트 (Phase 7.1에 통합)**
> 기능 테스트는 Phase 7.1 (기능 테스트 및 버그 수정)에서 진행

#### Deliverable
- ✅ 관리자 회원 관리 기능 (목록, 상세, 기기 해제)
- ✅ 관리자 결제 관리 강화 (필터링, 통계)

---

### Phase 7: 품질 검증 및 배포 (7-10일)

#### 목표
전체 기능 테스트, 반응형 검수, 프로덕션 배포

#### 작업 목록

**7.1 기능 테스트 및 버그 수정 (2-3일)**

**전체 기능 통합 테스트**
- [ ] 사용자 플로우 테스트
  - [ ] 회원가입 (이메일, 소셜 로그인)
  - [ ] 로그인 및 세션 유지
  - [ ] 강의 목록 조회 및 검색
  - [ ] 강의 상세 페이지
  - [ ] 결제 (카드, 무통장입금)
  - [ ] 강의 수강 (영상 재생, 이어보기)
  - [ ] 진도율 저장 및 표시
  - [ ] 강의 자료 다운로드
  - [ ] 환불 신청
  - [ ] 세금계산서 신청
  - [ ] 1:1 문의 작성
  - [ ] 등록 기기 관리

- [ ] 관리자 플로우 테스트
  - [ ] 관리자 로그인
  - [ ] 강의 생성/수정/삭제
  - [ ] 영상 업로드 (Vimeo)
  - [ ] 영상 순서 변경 (드래그 앤 드롭)
  - [ ] 강의 자료 업로드/삭제
  - [ ] 무통장입금 승인/거절
  - [ ] 환불 승인/거절
  - [ ] 세금계산서 발급
  - [ ] 1:1 문의 답변
  - [ ] 회원 관리 (목록, 상세, 기기 해제)
  - [ ] 결제 관리 (목록, 필터링, 통계)
  - [ ] 공지사항 작성

**성능 체크 (간단)**
- [ ] 주요 페이지 로딩 속도 확인 (5초 이내)
- [ ] 영상 재생 원활성 체크
- [ ] 이미지 로딩 확인
- [ ] 치명적인 성능 문제 수정

**버그 수정**
- [ ] 발견된 모든 버그 즉시 수정
- [ ] 에러 로그 확인 및 해결

---

**7.2 반응형 디자인 검수 (2-3일)**

**모바일 뷰 테스트 (주요 페이지)**
- [ ] 홈페이지 (강의 목록)
  - [ ] 강의 카드 레이아웃
  - [ ] 검색 기능
  - [ ] 네비게이션 메뉴
- [ ] 강의 상세 페이지
  - [ ] 강의 정보 표시
  - [ ] 커리큘럼 목록
  - [ ] 구매 버튼
- [ ] 강의 수강 페이지
  - [ ] 영상 플레이어 (세로 모드)
  - [ ] 영상 목록 (접기/펼치기)
  - [ ] 진도율 표시
- [ ] 내 강의실 (대시보드)
  - [ ] 수강 중인 강의 목록
  - [ ] 진도율 카드
- [ ] 결제 페이지
  - [ ] 주문 정보 표시
  - [ ] 결제 수단 선택
  - [ ] TossPayments 위젯
- [ ] 로그인/회원가입
  - [ ] 폼 레이아웃
  - [ ] 소셜 로그인 버튼

**태블릿 뷰 테스트**
- [ ] 주요 페이지 레이아웃 확인
- [ ] 2-column 레이아웃 검증

**치명적인 문제만 수정**
- [ ] 레이아웃 심각하게 깨짐
- [ ] 버튼 클릭 불가
- [ ] 텍스트 오버플로우
- [ ] 스크롤 불가

**크로스 브라우저 테스트 (기본)**
- [ ] Chrome (데스크톱, 모바일)
- [ ] Safari (macOS, iOS)
- [ ] Firefox
- [ ] Edge

---

**7.3 배포 준비 (2-3일)**

**환경 변수 정리**
- [ ] `.env.example` 파일 작성
  ```env
  # Database
  DATABASE_URL=

  # NextAuth
  NEXTAUTH_SECRET=
  NEXTAUTH_URL=

  # OAuth Providers
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  KAKAO_CLIENT_ID=
  KAKAO_CLIENT_SECRET=
  NAVER_CLIENT_ID=
  NAVER_CLIENT_SECRET=

  # TossPayments
  TOSS_CLIENT_KEY=
  TOSS_SECRET_KEY=

  # Vimeo
  VIMEO_ACCESS_TOKEN=

  # Supabase Storage
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- [ ] Production 환경 변수 목록 작성
- [ ] 민감한 정보 하드코딩 확인 및 제거

**Vercel 프로젝트 설정**
- [ ] Vercel 계정 생성/로그인
- [ ] 새 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] 빌드 설정 확인
  - [ ] Framework Preset: Next.js
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
- [ ] 환경 변수 설정 (Vercel 대시보드)
  - [ ] Production 환경 변수 입력
  - [ ] Preview 환경 변수 (선택적)

**Prisma 프로덕션 설정**
- [ ] Supabase Connection Pooling URL 확인
  - [ ] Transaction mode vs. Session mode
  - [ ] DATABASE_URL에 pooling URL 사용
- [ ] 프로덕션 DB에 마이그레이션 실행
  ```bash
  DATABASE_URL="your-production-url" npx prisma migrate deploy
  ```
- [ ] Prisma Client 생성 확인
  ```bash
  npx prisma generate
  ```

**Supabase 프로덕션 설정**
- [ ] Storage 버킷 확인 및 권한 설정
  - [ ] `course-materials` 버킷 public 설정
  - [ ] `course-thumbnails` 버킷 public 설정
- [ ] RLS (Row Level Security) 확인
- [ ] 백업 설정 (Supabase 자동 백업 확인)

**도메인 연결 (선택적)**
- [ ] 도메인 구매 (있다면)
- [ ] Vercel에 도메인 추가
- [ ] DNS 설정
  - [ ] A 레코드 또는 CNAME 레코드 추가
- [ ] SSL 인증서 자동 발급 확인

---

**7.4 프로덕션 배포 및 검증 (1일)**

**배포 실행**
- [ ] Vercel에 첫 배포 트리거
  - [ ] Git push 또는 수동 배포
- [ ] 빌드 로그 확인
  - [ ] 빌드 에러 없는지 확인
  - [ ] Warning 확인
- [ ] 배포 성공 확인
- [ ] Production URL 확인

**배포 후 검증 (Smoke Test)**
- [ ] 홈페이지 접속 확인
- [ ] 로그인 기능 확인
  - [ ] 이메일 로그인
  - [ ] Google OAuth
  - [ ] Kakao OAuth
  - [ ] Naver OAuth
- [ ] 강의 목록 로딩 확인
- [ ] 강의 상세 페이지 확인
- [ ] 영상 재생 확인 (Vimeo)
- [ ] 결제 테스트 (소액)
  - [ ] 카드 결제 (테스트 금액)
  - [ ] TossPayments 위젯 정상 작동
- [ ] 이미지 로딩 확인 (Supabase Storage)
- [ ] 강의 자료 다운로드 확인
- [ ] 관리자 페이지 접속 확인
- [ ] 데이터베이스 연결 확인

**모니터링 설정 (선택적)**
- [ ] Vercel Analytics 활성화
- [ ] Vercel Speed Insights 활성화
- [ ] Sentry 연동 (에러 추적)
  - [ ] Sentry 프로젝트 생성
  - [ ] `@sentry/nextjs` 설치
  - [ ] `sentry.client.config.ts`, `sentry.server.config.ts` 설정

**최종 확인**
- [ ] Production URL에서 전체 플로우 1회 테스트
- [ ] 모바일에서 접속 테스트
- [ ] 성능 확인 (로딩 속도)
- [ ] 에러 없는지 브라우저 콘솔 확인

#### Deliverable
- ✅ 전체 기능 동작 검증
- ✅ 반응형 디자인 검수 완료
- ✅ 프로덕션 배포 완료 (Vercel)
- ✅ 안정적인 서비스 운영

---

## 3. 전체 일정 요약

| Phase | 작업 내용 | 예상 기간 | 누적 기간 | 상태 |
|-------|-----------|-----------|-----------|------|
| Phase 1 | 기본 인프라 | 1-2주 | 1-2주 | ✅ 완료 |
| Phase 2 | 핵심 강의 기능 | 3-4주 | 4-6주 | ✅ 완료 |
| Phase 3 | 결제 시스템 | 2-3주 | 6-9주 | ✅ 완료 |
| Phase 4 | 진도율 및 학습 관리 | 1-2주 | 7-11주 | ✅ 완료 |
| Phase 5 | 부가 기능 | 2-3주 | 9-14주 | ✅ 완료 |
| Phase 6 | 관리자 고도화 (통계 제외) | 1주 | 10-15주 | ✅ 완료 |
| Phase 7 | 품질 검증 및 배포 | 7-10일 | 11-16주 | 🚀 진행 예정 |

**총 예상 기간: 11-16주 (약 3-4개월)**

**현재 진행률: 약 85% 완료** 🎉

---

## 4. 우선순위

### Must Have (필수)
- Phase 1: 기본 인프라
- Phase 2: 핵심 강의 기능
- Phase 3: 결제 시스템 (카드 결제, 무통장입금)
- Phase 4: 진도율 시스템

### Should Have (중요)
- Phase 5: 부가 기능 (등록기기, 공지사항, 1:1 문의)
- Phase 6: 관리자 고도화 (회원 관리, 통계)

### Could Have (선택적)
- Phase 7: 최적화 (일부는 필수, 일부는 선택)
  - 필수: 기본 SEO, 배포
  - 선택: 고급 최적화, 로깅 시스템

---

## 5. 리스크 관리

### 주요 리스크

**1. 토스페이먼츠 연동 복잡도**
- 리스크: 결제 연동 시 예상보다 시간이 오래 걸릴 수 있음
- 대응: 토스페이먼츠 공식 문서 및 샘플 코드 사전 학습, 충분한 테스트 시간 확보

**2. Vimeo API 제한**
- 리스크: Vimeo Starter 플랜의 API 호출 제한
- 대응: API 호출 최소화, 캐싱 활용

**3. 등록기기 관리 복잡도**
- 리스크: 기기 Fingerprinting이 정확하지 않을 수 있음
- 대응: FingerprintJS Pro 고려 (유료), 또는 간단한 방식 (User Agent + IP)

**4. 1인 개발로 인한 시간 지연**
- 리스크: 예상보다 개발 기간이 길어질 수 있음
- 대응: Phase별로 MVP 우선, 선택적 기능은 추후 추가

**5. 성능 이슈**
- 리스크: 사용자 증가 시 성능 저하
- 대응: 초기 설계 시 확장성 고려, 캐싱 전략, 데이터베이스 인덱싱

---

## 6. 다음 단계

WBS 작성 완료 후:

1. **Phase 1 시작**
   - 프로젝트 초기 설정
   - NextAuth.js 설정
   - 기본 UI/레이아웃

2. **일일/주간 진행 상황 체크**
   - 각 작업 완료 여부 체크
   - 예상 기간과 실제 소요 기간 비교
   - 필요 시 일정 조정

3. **Phase별 회고**
   - 각 Phase 완료 후 회고
   - 개선 사항 도출
   - 다음 Phase에 반영

---

## 마무리

이 WBS는 Private LMS 프로젝트의 전체 작업을 Phase별로 체계적으로 정리한 문서입니다.

각 Phase별로 명확한 목표와 작업 목록, 예상 기간이 정의되어 있어 개발을 효율적으로 진행할 수 있습니다.

개발 진행 중 상황에 따라 유연하게 조정하면서 진행하시기 바랍니다.

**화이팅!** 🚀
