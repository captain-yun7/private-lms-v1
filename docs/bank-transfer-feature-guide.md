# 무통장입금 관리 기능 가이드

## 개요
관리자가 무통장입금 신청 내역을 조회하고 승인/거절할 수 있는 기능입니다.

## 사용자 플로우

### 1. 사용자 (학생)
1. 강의 상세 페이지에서 "수강 신청" 클릭
2. 결제 페이지 (`/checkout/[courseId]`)에서 "무통장입금" 선택
3. 구매자 정보 + 입금 정보 입력
   - 이름, 이메일, 전화번호
   - 입금자명
   - 입금 예정일
4. "입금 정보 제출" 클릭
5. 입금 대기 페이지 (`/checkout/bank-transfer-pending`)로 이동
   - 입금 계좌 정보 표시 (계좌번호 복사 기능 포함)
   - 입금 안내 사항
6. 실제 계좌로 입금
7. 관리자 승인 대기 (1-2 영업일)
8. 승인 시 → 수강 등록 + 이메일 알림

### 2. 관리자
1. 관리자 페이지 사이드바에서 "무통장입금 승인" 클릭
2. 무통장입금 목록 조회 (`/admin/payments/bank-transfers`)
   - 필터: 전체 / 입금 대기 중 / 승인 완료 / 거절
3. 각 신청 건 확인
   - 강의명, 구매자 정보, 입금자명, 금액 등
4. 입금 확인 후 "승인" 또는 "거절" 처리

## API 엔드포인트

### 1. 무통장입금 신청 (사용자)
```
POST /api/payments/bank-transfer
```

**Request Body:**
```json
{
  "courseId": "course_id",
  "buyerName": "홍길동",
  "buyerEmail": "hong@email.com",
  "buyerPhone": "01012345678",
  "depositorName": "홍길동",
  "expectedDepositDate": "2025-10-22"
}
```

**Response:**
```json
{
  "success": true,
  "courseName": "JavaScript 기초",
  "amount": 50000,
  "depositorName": "홍길동",
  "bankInfo": {
    "bank": "신한은행",
    "accountNumber": "110-123-456789",
    "accountHolder": "(주)Private LMS"
  }
}
```

### 2. 무통장입금 목록 조회 (관리자)
```
GET /api/admin/payments/bank-transfers?status=PENDING
```

**Query Parameters:**
- `status`: ALL | PENDING | APPROVED | REJECTED

**Response:**
```json
{
  "transfers": [
    {
      "id": "transfer_id",
      "depositorName": "홍길동",
      "expectedDepositDate": "2025-10-22",
      "status": "PENDING",
      "createdAt": "2025-10-21T10:00:00Z",
      "payment": {
        "orderId": "BANK_123456",
        "purchase": {
          "amount": 50000,
          "user": {
            "name": "홍길동",
            "email": "hong@email.com"
          },
          "course": {
            "title": "JavaScript 기초"
          }
        }
      }
    }
  ]
}
```

### 3. 무통장입금 승인 (관리자)
```
POST /api/admin/payments/bank-transfers/[id]/approve
```

**Response:**
```json
{
  "success": true,
  "message": "승인되었습니다.",
  "enrollment": {
    "id": "enrollment_id",
    "userId": "user_id",
    "courseId": "course_id"
  }
}
```

**처리 내용:**
1. BankTransfer 상태 → APPROVED
2. Payment 상태 → COMPLETED
3. Purchase 상태 → COMPLETED
4. Enrollment 생성 (수강 등록)
5. Receipt 생성 (영수증)

### 4. 무통장입금 거절 (관리자)
```
POST /api/admin/payments/bank-transfers/[id]/reject
```

**Request Body:**
```json
{
  "reason": "입금자명 불일치"
}
```

**Response:**
```json
{
  "success": true,
  "message": "거절되었습니다."
}
```

**처리 내용:**
1. BankTransfer 상태 → REJECTED
2. Payment 상태 → CANCELED
3. Purchase 상태 → CANCELED

## 데이터베이스 스키마

### BankTransfer 모델
```prisma
model BankTransfer {
  id                  String               @id @default(cuid())
  paymentId           String               @unique
  depositorName       String               // 입금자명
  expectedDepositDate DateTime             // 입금 예정일
  status              BankTransferStatus   @default(PENDING)
  approvedAt          DateTime?            // 승인 시각
  approvedBy          String?              // 승인자 ID
  rejectedAt          DateTime?            // 거절 시각
  rejectedBy          String?              // 거절자 ID
  rejectionReason     String?              // 거절 사유
  createdAt           DateTime             @default(now())

  payment Payment @relation(fields: [paymentId], references: [id])
}

enum BankTransferStatus {
  PENDING   // 입금 대기
  APPROVED  // 승인 완료
  REJECTED  // 거절
}
```

## 데이터베이스 마이그레이션

Supabase Dashboard > SQL Editor에서 다음 파일을 실행하세요:
```
docs/migration-bank-transfer-fields.sql
```

## 파일 구조

```
src/
├── app/
│   ├── checkout/
│   │   ├── [courseId]/page.tsx          # 결제 페이지 (무통장입금 선택)
│   │   └── bank-transfer-pending/
│   │       └── page.tsx                  # 입금 대기 페이지
│   ├── admin/
│   │   └── payments/
│   │       └── bank-transfers/
│   │           └── page.tsx              # 관리자 무통장입금 관리 페이지
│   └── api/
│       ├── payments/
│       │   └── bank-transfer/
│       │       └── route.ts              # 무통장입금 신청 API
│       └── admin/
│           └── payments/
│               └── bank-transfers/
│                   ├── route.ts          # 목록 조회 API
│                   └── [id]/
│                       ├── approve/
│                       │   └── route.ts  # 승인 API
│                       └── reject/
│                           └── route.ts  # 거절 API
└── components/
    └── AdminSidebar.tsx                  # "무통장입금 승인" 메뉴 추가
```

## 환경 변수

무통장입금은 별도의 환경 변수가 필요하지 않습니다.
입금 계좌 정보는 하드코딩되어 있으며, 필요 시 다음 파일에서 수정할 수 있습니다:

- `/api/payments/bank-transfer/route.ts`
- `/checkout/bank-transfer-pending/page.tsx`

현재 설정된 계좌:
```
은행: 신한은행
계좌번호: 110-123-456789
예금주: (주)Private LMS
```

## 주의 사항

1. **중복 Enrollment 방지**: 승인 API는 이미 Enrollment가 있는지 확인하여 중복 생성을 방지합니다.

2. **트랜잭션 처리**: 승인/거절 처리는 모두 Prisma 트랜잭션으로 처리되어 데이터 무결성을 보장합니다.

3. **이메일 알림**: 현재 이메일 알림 기능은 주석 처리되어 있습니다. 나중에 이메일 서비스를 연동하면 활성화할 수 있습니다.

4. **계좌 정보 관리**: 입금 계좌 정보는 하드코딩되어 있으므로, 변경이 필요한 경우 코드를 직접 수정해야 합니다.

## 다음 단계

1. **이메일 알림 기능 구현** (선택)
   - 무통장입금 신청 시 관리자에게 알림
   - 승인/거절 시 사용자에게 알림

2. **영수증 페이지** 구현
   - `/receipts/[id]` 페이지
   - PDF 다운로드 기능

3. **결제 내역 페이지** 구현
   - `/mypage/payments` 페이지
   - 사용자의 모든 결제 내역 조회

4. **환불 시스템** 구현 (선택)
   - 환불 신청 페이지
   - 관리자 환불 승인 기능
