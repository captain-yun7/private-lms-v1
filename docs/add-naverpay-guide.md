# 네이버페이 추가 가이드

## 현재 상태

**구현됨:**
- ✅ 카드 결제 (TossPayments)
- ✅ 무통장입금

**구현 안 됨:**
- ❌ 네이버페이
- ❌ 카카오페이
- ❌ 토스페이

---

## TossPayments를 통한 네이버페이 연동

TossPayments는 여러 간편결제를 지원합니다:
- 카드
- 네이버페이
- 카카오페이
- 토스페이
- 페이코

### 방법 1: 코드 수정 (간단)

현재 결제 페이지를 수정하여 네이버페이 버튼을 추가할 수 있습니다.

#### 1. 결제 수단 선택 UI 수정

```typescript
// src/app/checkout/[courseId]/page.tsx

const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'NAVERPAY' | 'BANK_TRANSFER'>('CARD');

// UI에서 선택 옵션 추가
<div className="space-y-3">
  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
    <input
      type="radio"
      value="CARD"
      checked={paymentMethod === 'CARD'}
      onChange={(e) => setPaymentMethod(e.target.value as any)}
    />
    <span>💳 카드 결제</span>
  </label>

  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
    <input
      type="radio"
      value="NAVERPAY"
      checked={paymentMethod === 'NAVERPAY'}
      onChange={(e) => setPaymentMethod(e.target.value as any)}
    />
    <span>🟢 네이버페이</span>
  </label>

  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
    <input
      type="radio"
      value="BANK_TRANSFER"
      checked={paymentMethod === 'BANK_TRANSFER'}
      onChange={(e) => setPaymentMethod(e.target.value as any)}
    />
    <span>🏦 무통장입금</span>
  </label>
</div>
```

#### 2. 결제 처리 로직 수정

```typescript
// TossPayments SDK 호출 시 method 지정
const handleCardPayment = async () => {
  // ... 기존 코드

  await tossPayments.current?.requestPayment({
    method: 'CARD',  // 또는 'NAVERPAY', 'KAKAOPAY'
    amount: { currency: 'KRW', value: course.price },
    orderId: data.orderId,
    orderName: course.title,
    successUrl: `${window.location.origin}/checkout/success`,
    failUrl: `${window.location.origin}/checkout/fail`,
    customerName: buyerInfo.name,
    customerEmail: buyerInfo.email,
  });
};

const handleNaverPay = async () => {
  // ... 동일한 로직, method만 변경
  await tossPayments.current?.requestPayment({
    method: 'NAVERPAY',  // ← 이것만 바꾸면 됨!
    // ... 나머지 동일
  });
};
```

---

## ⚠️ 중요: 테스트 모드 안전성

### 네이버페이도 테스트 모드에서는 안전합니다!

```
현재 사용 중인 키: test_ck_..., test_sk_...
→ 네이버페이를 선택해도 테스트 결제창이 열림
→ 실제 네이버페이 계정과 연결 안 됨
→ 실제 돈 청구 없음 ✅
```

### 테스트 환경에서 네이버페이 선택 시:
1. TossPayments 테스트 결제창 열림
2. "네이버페이 시뮬레이션" 화면 표시
3. 결제 성공/실패 선택 가능
4. **실제 네이버페이 계정과 무관**
5. **실제 돈 청구 없음**

---

## 🛡️ 실제 결제가 발생하는 경우

**실제 네이버페이 결제가 되려면:**

1. ✅ TossPayments 운영 키 발급 (`live_ck_`, `live_sk_`)
2. ✅ 사업자등록증 제출
3. ✅ TossPayments 심사 통과
4. ✅ 네이버페이 가맹점 추가 신청
5. ✅ 네이버페이 심사 통과
6. ✅ 사용자가 **실제 네이버페이 계정**으로 로그인

**현재는 1번도 안 함 → 100% 안전**

---

## 📊 결제 수단별 비교

| 결제 수단 | 현재 구현 | 테스트 모드 | 실제 결제 |
|---------|---------|----------|----------|
| 카드 결제 | ✅ | 안전 (가짜 카드) | ❌ 불가능 |
| 무통장입금 | ✅ | 안전 (가짜 계좌) | ❌ 불가능 |
| 네이버페이 | ❌ | 안전 (시뮬레이션) | ❌ 불가능 |
| 카카오페이 | ❌ | 안전 (시뮬레이션) | ❌ 불가능 |
| 토스페이 | ❌ | 안전 (시뮬레이션) | ❌ 불가능 |

**모든 결제 수단은 테스트 키 사용 시 100% 안전합니다.**

---

## 🚀 네이버페이 추가하는 간단한 방법

위에서 설명한 코드를 적용하면:

### Before (현재)
```
결제 수단 선택:
○ 카드 결제
○ 무통장입금
```

### After (네이버페이 추가)
```
결제 수단 선택:
○ 카드 결제
○ 네이버페이      ← 추가!
○ 무통장입금
```

### 테스트 시:
- 네이버페이 선택 → 결제하기 클릭
- TossPayments 테스트 결제창 열림
- "네이버페이로 결제" 버튼 (시뮬레이션)
- 결제 성공/실패 선택
- **실제 돈 청구: 0원 ✅**

---

## 💡 결론

### 질문: "네이버페이 99,000원 나오는데 돈 안 나가?"
**답변: 100% 안 나갑니다!**

**이유:**
1. 현재 테스트 키 사용 중 (`test_ck_`, `test_sk_`)
2. 테스트 환경은 **모든** 결제 수단이 시뮬레이션
3. 네이버페이, 카카오페이 모두 테스트 모드에서는 가짜
4. 실제 계정/결제망과 연결 안 됨

### 안심하세요!
- 테스트 모드 = 모든 결제 수단 안전
- 카드, 네이버페이, 카카오페이, 토스페이 모두 동일
- 1억원 결제해도 0원 청구
- 실제 결제는 운영 키 + 실명 인증 + 사업자등록 필요

---

## 🔧 지금 당장 네이버페이 추가하고 싶다면?

알려주시면 코드를 수정해드리겠습니다!

추가할 결제 수단:
- [ ] 네이버페이
- [ ] 카카오페이
- [ ] 토스페이
- [ ] 페이코

원하시는 것 알려주시면 바로 구현하겠습니다! 🚀
