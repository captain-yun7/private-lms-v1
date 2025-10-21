# TossPayments 테스트 모드 - 안전성 보장

## ✅ 절대 안전합니다!

### 테스트 키 사용 시 보장사항

현재 `.env` 파일에 설정된 키:
```env
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..." # test_로 시작
TOSS_SECRET_KEY="test_sk_..."             # test_로 시작
```

**`test_`로 시작하는 키는 100% 테스트 전용입니다.**

---

## 🛡️ 왜 안전한가?

### 1. 테스트 키의 특징
- **`test_ck_`**: 테스트 클라이언트 키 (Client Key)
- **`test_sk_`**: 테스트 시크릿 키 (Secret Key)
- 이 키들은 **절대** 실제 금융망에 연결되지 않음
- TossPayments 샌드박스 환경에서만 동작

### 2. 테스트 카드번호
```
4400000000000008  ← 이것은 가짜 카드번호입니다
```
- **실제 존재하지 않는** 테스트 전용 카드번호
- 어떤 은행/카드사와도 연결되지 않음
- TossPayments가 테스트 목적으로 제공하는 가상 번호

### 3. 금액도 가짜
- 99,000원이든 999,999,999원이든 **실제 청구 절대 없음**
- 모든 거래는 TossPayments 테스트 서버에서만 기록됨
- 실제 PG사나 금융사에 전송되지 않음

---

## 🔍 직접 확인하는 방법

### 방법 1: 개발자 도구 Network 탭
```
1. 브라우저 개발자도구 열기 (F12)
2. Network 탭
3. 결제 진행
4. API 호출 확인:
   - URL: https://api.tosspayments.com/v1/payments/confirm
   - 요청 헤더에 test_sk_ 키 확인
```

### 방법 2: TossPayments 대시보드
```
1. https://developers.tosspayments.com/ 로그인
2. 내 앱 → 테스트 API 키 탭
3. "테스트 결제 내역" 확인
4. 실제 정산 금액: 0원 (영원히 0원)
```

### 방법 3: 코드에서 확인
```typescript
// src/app/api/payments/confirm/route.ts
const secretKey = process.env.TOSS_SECRET_KEY;

// 테스트 키인지 확인
if (secretKey?.startsWith('test_')) {
  console.log('✅ 테스트 모드 - 실제 청구 없음');
}

const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
  // ↑ 이 URL은 테스트 키 사용 시 테스트 환경으로 자동 라우팅됨
});
```

---

## ⚠️ 실제 결제가 되는 경우 (현재는 해당 없음)

**실제 결제가 발생하려면:**

1. **실제 운영 키 필요** (현재 없음)
   ```env
   NEXT_PUBLIC_TOSS_CLIENT_KEY="live_ck_..." # live_로 시작
   TOSS_SECRET_KEY="live_sk_..."             # live_로 시작
   ```

2. **사업자 등록 및 TossPayments 심사 통과** (현재 안 함)
   - 사업자등록증 제출
   - 계좌 인증
   - 대표자 실명 인증
   - 정산 계좌 등록

3. **실제 카드번호 입력** (현재 사용 안 함)
   - 본인의 실제 카드
   - 카드 뒷면 CVC
   - 비밀번호

**위 3가지가 모두 충족되어야 실제 결제 가능**
**현재는 하나도 해당 없음 → 100% 안전**

---

## 🧪 테스트 시나리오별 확인

### 시나리오 1: 카드 결제 99,000원
```
✅ 사용된 키: test_ck_... (테스트)
✅ 카드번호: 4400000000000008 (가짜)
✅ API: api.tosspayments.com (테스트 환경)
✅ 실제 청구: 0원
✅ 은행 승인: 없음 (시뮬레이션)
```

### 시나리오 2: 무통장입금 50,000원
```
✅ 입금 계좌: 110-123-456789 (코드에 하드코딩된 가짜 계좌)
✅ 실제 은행: 연결 안 됨
✅ 관리자 승인: DB만 업데이트
✅ 실제 입금 확인: 없음
```

---

## 📊 TossPayments 공식 문서 인용

> **테스트 키로는 절대 실제 결제가 발생하지 않습니다.**
>
> 테스트 키는 개발 및 테스트 목적으로만 사용되며,
> 실제 금융망과 연결되지 않습니다.
>
> 출처: https://docs.tosspayments.com/guides/v2/get-started#테스트-키

---

## 🎯 결론

### 현재 상태
```
환경: 개발 (Development)
키 타입: 테스트 (test_ck_, test_sk_)
카드번호: 가짜 (4400000000000008)
금액: 가상 (99,000원도 100억원도 동일)
실제 청구: 0원 ✅
```

### 안심하고 테스트하세요!
- 1억원을 결제해도 0원 청구
- 하루에 1000번 결제해도 0원 청구
- 카드번호 4400000000000008은 TossPayments가 제공하는 테스트 전용
- 실제 카드/계좌와 아무 관련 없음

---

## 🔐 추가 보안 확인

현재 프로젝트 `.env` 파일:
```bash
# 테스트 키 확인
cat .env | grep TOSS

# 출력:
# NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_jExPeJWYVQeK5NDQgbAnV49R5gvN"
# TOSS_SECRET_KEY="test_sk_PBal2vxj811MY11GPp5k85RQgOAN"
```

**`test_`로 시작 → 100% 안전 보장**

---

## ❓ 자주 묻는 질문

### Q1: 테스트 카드번호를 실수로 실제 결제에 사용하면?
**A:** 불가능합니다. 테스트 키로는 실제 결제창 자체가 열리지 않습니다.

### Q2: 테스트 모드에서 내 실제 카드번호를 입력하면?
**A:** 테스트 환경에서는 거절됩니다. 테스트 카드번호만 작동합니다.

### Q3: 실수로 운영 키를 사용할 가능성은?
**A:** 현재 운영 키가 없습니다. 발급받으려면:
- TossPayments 가입
- 사업자등록증 제출
- 심사 통과 (1-2주 소요)
- 정산 계좌 등록
- 실명 인증

**→ 이 모든 과정 없이는 운영 키 발급 불가능**

---

## ✨ 최종 확인

```bash
# 테스트 모드 체크 스크립트 실행
./scripts/test-phase3.sh

# 또는 직접 확인
grep "TOSS" .env

# test_로 시작하면 → 100% 안전!
```

**걱정하지 마세요! 마음껏 테스트하셔도 됩니다! 🚀**
