# 결제 취소 기간 제한

## 🏦 TossPayments 결제 취소 정책

### 1. 카드 결제 취소 기간

#### 자동 취소 가능 기간
```
결제 당일 23:59까지: 즉시 취소 (매출 전표 미발생)
결제 다음날 이후: 승인 취소 → 카드사 정산일에 반영
```

#### 실제 제한
**TossPayments 공식 정책:**
- **일반 취소: 결제일로부터 1년 이내**
- 1년 경과 시: API 취소 불가, 수동 처리 필요

---

## 📊 결제 수단별 취소 규칙

### 카드 결제 (신용/체크)
| 시점 | 취소 방법 | 반영 시간 |
|-----|---------|---------|
| 결제 당일 | 즉시 취소 | 실시간 (매출 미발생) |
| 결제 익일~ | 승인 취소 | 카드사 정산일 (3~7일) |
| 1년 이후 | ❌ API 취소 불가 | 수동 처리 필요 |

**카드사별 정산 주기:**
- 신한/국민/하나: 매월 5일, 20일
- 삼성/현대/롯데: 매월 10일, 25일
- BC/NH농협: 매월 15일, 30일

### 무통장입금
| 시점 | 환불 방법 | 반영 시간 |
|-----|---------|---------|
| 입금 전 | 취소만 하면 됨 | 즉시 |
| 입금 후 | 수동 환불 (계좌 이체) | 관리자가 직접 입금 |

**제한 없음** (관리자가 수동으로 처리)

---

## 🚨 현재 코드의 문제점

우리 코드를 확인해보겠습니다:

```typescript
// src/app/api/admin/refunds/[id]/approve/route.ts
// 카드 결제인 경우 토스페이먼츠 API로 환불 처리
if (payment.method === "CARD" && payment.paymentKey) {
  const tossResponse = await fetch(
    `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cancelReason: refund.reason,
      }),
    }
  );

  // ⚠️ 문제: 1년 경과 여부 확인 안 함!
}
```

**문제점:**
1. ❌ 결제일로부터 1년 경과 여부 확인 안 함
2. ❌ 1년 경과 시 TossPayments API 호출 실패
3. ❌ 에러 처리만 하고 대안 없음

---

## ✅ 개선 방안

### 방안 1: 1년 제한 추가 (엄격)

```typescript
// 결제일로부터 1년 경과 확인
const paymentDate = new Date(payment.paidAt);
const now = new Date();
const yearsDiff = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

if (yearsDiff > 1) {
  return NextResponse.json(
    {
      error: "결제일로부터 1년이 경과하여 자동 환불이 불가능합니다",
      detail: "고객센터를 통해 수동 환불을 진행해주세요"
    },
    { status: 400 }
  );
}
```

**장점:**
- TossPayments API 에러 방지
- 명확한 정책

**단점:**
- 1년 넘은 사용자는 환불 못 받음 (불친절)

---

### 방안 2: 1년 경과 시 수동 환불 안내 (권장)

```typescript
const paymentDate = new Date(payment.paidAt);
const now = new Date();
const yearsDiff = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

if (payment.method === "CARD" && payment.paymentKey) {
  if (yearsDiff > 1) {
    // 1년 경과: API 호출하지 않고 수동 처리 안내
    return NextResponse.json(
      {
        success: false,
        requireManualRefund: true,
        message: "결제일로부터 1년이 경과하여 자동 환불이 불가능합니다",
        detail: "관리자가 직접 고객 계좌로 환불 처리해주세요",
        refundInfo: {
          amount: refund.refundAmount,
          userName: refund.purchase.user.name,
          accountInfo: `${refund.accountBank} ${refund.accountNumber} (${refund.accountHolder})`
        }
      },
      { status: 200 } // 에러가 아님
    );
  }

  // 1년 이내: 정상적으로 TossPayments API 호출
  const tossResponse = await fetch(/*...*/);
}
```

**장점:**
- 유연한 대응
- 사용자 불만 감소
- 관리자가 수동으로 처리 가능

**단점:**
- 관리자 작업 필요

---

### 방안 3: 7일 제한 (일반적)

대부분의 온라인 강의 플랫폼:
```
결제 후 7일 이내만 환불 가능
```

**근거:**
- 전자상거래법: 7일 내 청약 철회 가능
- 온라인 콘텐츠는 예외 가능 (콘텐츠 소비 시)

```typescript
const paymentDate = new Date(payment.paidAt);
const now = new Date();
const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));

if (daysDiff > 7) {
  return NextResponse.json(
    { error: "결제일로부터 7일이 경과하여 환불이 불가능합니다" },
    { status: 400 }
  );
}
```

---

## 📋 실제 플랫폼 사례

### 인프런
```
결제 후 7일 이내 + 진도율 10% 미만
```

### 패스트캠퍼스
```
결제 후 7일 이내 + 강의 시작 전
```

### 유데미
```
결제 후 30일 이내 (진도율 무관)
```

### 클래스101
```
결제 후 7일 이내 + 콘텐츠 30% 미만 소비
```

---

## 🎯 추천 정책

### 개인 LMS (현재 프로젝트)

**옵션 A: 7일 + 진도율 10% (일반적)**
```typescript
// 1. 7일 제한
if (daysDiff > 7) {
  return "7일 경과";
}

// 2. 진도율 10% 제한
if (progressRate > 10) {
  return "진도율 초과";
}

// 3. 통과하면 환불 진행
```

**옵션 B: 1년 + 진도율 10% (여유)**
```typescript
// 1. 1년 제한 (TossPayments 제한)
if (yearsDiff > 1) {
  return "수동 환불 안내";
}

// 2. 진도율 10% 제한
if (progressRate > 10) {
  return "진도율 초과";
}

// 3. 통과하면 환불 진행
```

---

## 💡 제 추천

### 사용자 환불 신청 시 (프론트엔드)
```
7일 + 진도율 10% 제한
→ 일반적이고 명확한 정책
```

### 관리자 환불 승인 시 (백엔드)
```
1년 경과 여부만 확인
→ 7일 넘었어도 관리자 재량으로 승인 가능
→ 1년 넘으면 수동 환불 안내
```

**이렇게 하면:**
- 사용자: 명확한 정책 (7일 + 10%)
- 관리자: 유연한 대응 (1년까지 가능)
- TossPayments: API 에러 방지

---

## 🔧 구현 여부

환불 정책을 추가할까요?

1. **7일 + 진도율 10%** (사용자 신청 제한)
2. **1년 제한** (관리자 승인 시 확인)
3. **둘 다 추가** (권장)
4. **현재 유지** (제한 없음)

선택해주시면 바로 구현하겠습니다!
