# Phase 3 결제 시스템 테스트 가이드

## 1. 사전 준비

### 1.1 TossPayments 테스트 키 발급

**방법 1: 공식 문서에서 제공하는 테스트 키 사용 (간단)**

TossPayments는 바로 사용할 수 있는 테스트 키를 제공합니다:

```bash
# .env 파일에 추가
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"
TOSS_SECRET_KEY="test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"
```

**방법 2: 개발자 센터에서 직접 발급 (권장)**

1. [TossPayments 개발자 센터](https://developers.tosspayments.com/) 접속
2. 회원가입/로그인
3. "내 앱 관리" → "새 앱 만들기"
4. 앱 이름 입력 (예: Private LMS Test)
5. "테스트 API 키" 탭에서 키 복사
   - **클라이언트 키**: `test_ck_XXXXX`
   - **시크릿 키**: `test_sk_XXXXX`

### 1.2 .env 파일 설정

```bash
# .env.example 파일을 .env로 복사
cp .env.example .env

# .env 파일 편집
nano .env  # 또는 code .env
```

필수 환경변수:
```env
# Database (이미 설정되어 있어야 함)
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-url"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# TossPayments (여기에 테스트 키 입력)
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"
TOSS_SECRET_KEY="test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## 2. 개발 서버 실행

```bash
# 패키지 설치 (처음이거나 package.json이 변경된 경우)
npm install

# 데이터베이스 마이그레이션 (처음이거나 스키마 변경된 경우)
npx prisma generate
npx prisma db push

# 개발 서버 실행
npm run dev
```

서버가 실행되면 브라우저에서 http://localhost:3000 접속

---

## 3. 테스트 시나리오

### 시나리오 1: 카드 결제 테스트 (일반 사용자)

#### Step 1: 회원가입/로그인
1. http://localhost:3000/register 접속
2. 테스트 계정 생성
   - 이름: 테스트 사용자
   - 이메일: test@example.com
   - 비밀번호: test1234

#### Step 2: 강의 선택
1. http://localhost:3000/courses 접속
2. 강의 카드 클릭 → 강의 상세 페이지
3. "수강 신청" 버튼 클릭

#### Step 3: 카드 결제 진행
1. 결제 페이지에서 "카드 결제" 선택
2. 구매자 정보 입력:
   - 이름: 홍길동
   - 이메일: hong@example.com
   - 전화번호: 010-1234-5678
3. "결제하기" 버튼 클릭

#### Step 4: TossPayments 테스트 결제창
1. 테스트 결제창이 열림
2. **테스트 카드 정보 입력:**
   - 카드번호: `4400000000000008` (성공 테스트 카드)
   - 만료일: 미래 날짜 (예: 2025년 12월)
   - CVC: 임의 3자리 (예: 123)
   - 카드 비밀번호 앞 2자리: 12
3. "결제하기" 클릭

#### Step 5: 결제 완료 확인
1. `/checkout/success` 페이지로 리디렉션
2. "결제가 완료되었습니다" 메시지 확인
3. 강의 수강 버튼 확인

#### Step 6: 영수증 확인
1. "내 결제 내역" 페이지 이동: http://localhost:3000/mypage/payments
2. 방금 결제한 강의 확인
3. "영수증 보기" 버튼 클릭
4. 영수증 페이지에서 정보 확인
5. "인쇄하기" 버튼 테스트

**TossPayments 테스트 카드번호:**
- 성공: `4400000000000008`
- 실패 (잔액 부족): `4400000000000016`
- 실패 (한도 초과): `4400000000000024`

---

### 시나리오 2: 무통장입금 테스트

#### Step 1: 무통장입금 신청
1. 강의 상세 페이지에서 "수강 신청" 클릭
2. 결제 페이지에서 "무통장입금" 선택
3. 정보 입력:
   - 구매자 정보: 이름, 이메일, 전화번호
   - 입금자명: 홍길동
   - 입금 예정일: 내일 날짜 선택
4. "입금 정보 제출" 클릭

#### Step 2: 입금 대기 페이지 확인
1. `/checkout/bank-transfer-pending` 페이지로 이동
2. 입금 계좌 정보 확인:
   - 은행: 신한은행
   - 계좌번호: 110-123-456789
   - 예금주: (주)Private LMS
3. 계좌번호 복사 버튼 테스트

#### Step 3: 관리자로 승인 처리
1. 새 시크릿 창 열기 (또는 로그아웃)
2. 관리자 계정으로 로그인
   - 관리자 계정이 없다면 DB에서 role을 ADMIN으로 변경:
   ```sql
   -- Prisma Studio 또는 SQL 쿼리
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
   ```
3. http://localhost:3000/admin/payments/bank-transfers 접속
4. "입금 대기 중" 탭 클릭
5. 방금 신청한 입금 건 확인
6. "승인" 버튼 클릭

#### Step 4: 승인 완료 확인
1. 사용자 계정으로 돌아가기
2. "내 결제 내역" 페이지 새로고침
3. "입금이 확인되었습니다" 상태 확인
4. "영수증 보기" 버튼 생성 확인

---

### 시나리오 3: 환불 테스트

#### Step 1: 환불 신청 (사용자)
1. http://localhost:3000/mypage/payments 접속
2. 결제 완료된 강의에서 "환불 신청" 버튼 클릭
3. 환불 사유 작성 (10자 이상)
4. 결제 수단 선택:
   - **카드 결제인 경우**: 그대로 진행
   - **무통장입금인 경우**: 환불 계좌 정보 입력
     - 은행명: 신한은행
     - 계좌번호: 123-456-789
     - 예금주명: 홍길동
5. "환불 신청" 버튼 클릭
6. "환불 신청이 완료되었습니다" 알림 확인

#### Step 2: 환불 승인 (관리자)
1. 관리자 계정으로 로그인
2. http://localhost:3000/admin/refunds 접속
3. "승인 대기" 탭에서 환불 신청 확인
4. 환불 사유 확인
5. "승인" 버튼 클릭
6. 확인 메시지:
   - 카드: "환불이 승인되었습니다. 카드사를 통해 환불 처리됩니다."
   - 무통장: "환불이 승인되었습니다. 입력하신 계좌로 환불 처리됩니다."

#### Step 3: 환불 완료 확인
1. 사용자 계정으로 돌아가기
2. "내 결제 내역" 페이지에서 "환불 완료" 상태 확인
3. 해당 강의 수강 불가 확인 (Enrollment 삭제됨)

#### Step 4: 환불 거절 테스트
1. 새로운 환불 신청 생성
2. 관리자 페이지에서 "거절" 버튼 클릭
3. 거절 사유 입력 (10자 이상)
4. "거절" 버튼 클릭
5. 사용자 페이지에서 "환불 거절됨" 상태 확인

---

## 4. 빠른 테스트 체크리스트

### ✅ 카드 결제
- [ ] 결제 페이지 로딩
- [ ] TossPayments 결제창 열림
- [ ] 테스트 카드로 결제 성공
- [ ] 결제 완료 페이지 표시
- [ ] Purchase 레코드 생성 (status: COMPLETED)
- [ ] Payment 레코드 생성 (status: COMPLETED)
- [ ] Enrollment 생성 (수강 등록)
- [ ] Receipt 생성 (영수증)
- [ ] 강의 수강 가능

### ✅ 무통장입금
- [ ] 무통장입금 신청
- [ ] 입금 대기 페이지 표시
- [ ] 계좌번호 복사 기능
- [ ] 관리자: 입금 대기 목록 조회
- [ ] 관리자: 입금 승인
- [ ] Purchase/Payment 상태 변경 (COMPLETED)
- [ ] Enrollment 생성
- [ ] Receipt 생성
- [ ] 관리자: 입금 거절 테스트

### ✅ 영수증
- [ ] 영수증 페이지 접근
- [ ] 영수증 정보 표시 (구매자, 상품, 금액)
- [ ] 인쇄 버튼 동작
- [ ] 타인 영수증 접근 차단 (403)

### ✅ 환불
- [ ] 환불 신청 페이지
- [ ] 환불 사유 입력 (유효성 검사)
- [ ] 무통장입금: 계좌 정보 필수
- [ ] 관리자: 환불 목록 조회
- [ ] 관리자: 환불 승인
- [ ] 카드: TossPayments 취소 API 호출
- [ ] Purchase 상태 REFUNDED로 변경
- [ ] Enrollment 삭제
- [ ] Progress 삭제
- [ ] 관리자: 환불 거절 (사유 입력)

---

## 5. 문제 해결

### 문제 1: "NEXTAUTH_SECRET is not defined"
```bash
# .env 파일에 추가
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 문제 2: TossPayments 결제창이 안 열림
- 브라우저 콘솔 확인
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`가 `.env`에 있는지 확인
- 개발 서버 재시작: `npm run dev`

### 문제 3: 결제 승인 실패 "TOSS_SECRET_KEY is not defined"
- `TOSS_SECRET_KEY`가 `.env`에 있는지 확인 (NEXT_PUBLIC_ 없음)
- 서버 재시작

### 문제 4: 관리자 페이지 접근 불가
```bash
# Prisma Studio로 role 변경
npx prisma studio
# 또는 SQL
# UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### 문제 5: 영수증/환불 API 404
- 서버 재시작
- 라우트 파일 경로 확인

---

## 6. 데이터베이스 확인 (Prisma Studio)

```bash
npx prisma studio
```

브라우저에서 http://localhost:5555 접속

확인할 테이블:
- **Purchase**: status 확인 (PENDING → COMPLETED → REFUNDED)
- **Payment**: paymentKey, status 확인
- **BankTransfer**: status 확인 (PENDING → APPROVED)
- **Receipt**: receiptNumber 확인
- **Refund**: status 확인 (PENDING → COMPLETED)
- **Enrollment**: 결제 후 생성, 환불 후 삭제
- **Progress**: 환불 후 삭제

---

## 7. 개발자 도구 활용

### 브라우저 콘솔
```javascript
// 결제 요청 로그
console.log('결제 요청:', { courseId, amount, method });

// API 응답 확인
console.log('API 응답:', response);
```

### Network 탭
- `/api/payments/request` - 결제 요청
- `/api/payments/confirm` - 카드 결제 승인
- `/api/payments/bank-transfer` - 무통장입금 신청
- `/api/receipts/[id]` - 영수증 조회
- `/api/refunds` - 환불 신청

---

## 8. 다음 단계

Phase 3 테스트 완료 후:
1. Phase 4 진행 (진도율 및 학습 관리)
2. 실제 운영 환경 설정 (Production TossPayments 키)
3. 이메일 알림 추가 (환불 승인/거절 시)
4. 통계 대시보드 (Phase 6)

---

**테스트 중 문제가 발생하면 터미널 로그와 브라우저 콘솔을 확인하세요!**
