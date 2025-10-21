# 환불 정책 옵션

## 현재 상태

**구현된 규칙:**
- ✅ 본인만 환불 신청 가능
- ✅ 중복 환불 신청 불가
- ✅ 이미 환불된 구매 불가
- ✅ 결제 완료 상태만 환불 가능

**구현되지 않은 규칙:**
- ❌ 시간 제한 없음 (언제든지 환불 가능)
- ❌ 진도율 제한 없음 (100% 수강해도 환불 가능)
- ❌ 부분 환불 없음 (항상 100% 환불)

---

## 추가 가능한 정책

### 옵션 1: 시간 제한 (7일)

**규칙:**
- 결제일로부터 7일 이내만 환불 가능
- 7일 이후에는 환불 신청 버튼 비활성화

**장점:**
- 악용 방지 (강의 다 보고 환불하는 것 방지)
- 일반적인 이커머스 정책과 동일

**단점:**
- 사용자 불만 가능성

**코드 예시:**
```typescript
// 구매일로부터 7일 경과 확인
const purchaseDate = new Date(purchase.createdAt);
const now = new Date();
const daysDiff = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

if (daysDiff > 7) {
  return NextResponse.json(
    { error: "결제일로부터 7일이 경과하여 환불이 불가능합니다" },
    { status: 400 }
  );
}
```

---

### 옵션 2: 진도율 제한 (10%)

**규칙:**
- 강의 진도율이 10% 미만인 경우만 환불 가능
- 10% 이상 수강한 경우 환불 불가

**장점:**
- 강의를 어느 정도 확인한 후 결정 가능
- 악용 방지 (거의 다 보고 환불 불가)

**단점:**
- 진도율 계산 로직 필요

**코드 예시:**
```typescript
// 진도율 확인
const totalVideos = await prisma.video.count({
  where: { courseId: purchase.courseId },
});

const completedVideos = await prisma.progress.count({
  where: {
    userId: purchase.userId,
    isCompleted: true,
    video: {
      courseId: purchase.courseId,
    },
  },
});

const progressRate = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

if (progressRate > 10) {
  return NextResponse.json(
    { error: `진도율 ${progressRate.toFixed(1)}%로 환불이 불가능합니다 (10% 미만만 가능)` },
    { status: 400 }
  );
}
```

---

### 옵션 3: 7일 + 10% 제한 (권장)

**규칙:**
- 결제일로부터 7일 이내 **그리고**
- 진도율 10% 미만인 경우만 환불 가능

**장점:**
- 가장 합리적인 정책
- 대부분의 온라인 강의 플랫폼이 사용

**단점:**
- 구현이 조금 복잡

**코드 예시:**
```typescript
// 1. 시간 확인
const purchaseDate = new Date(purchase.createdAt);
const now = new Date();
const daysDiff = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

if (daysDiff > 7) {
  return NextResponse.json(
    { error: "결제일로부터 7일이 경과하여 환불이 불가능합니다" },
    { status: 400 }
  );
}

// 2. 진도율 확인
const totalVideos = await prisma.video.count({
  where: { courseId: purchase.courseId },
});

const completedVideos = await prisma.progress.count({
  where: {
    userId: purchase.userId,
    isCompleted: true,
    video: {
      courseId: purchase.courseId,
    },
  },
});

const progressRate = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

if (progressRate > 10) {
  return NextResponse.json(
    {
      error: `진도율 ${progressRate.toFixed(1)}%로 환불이 불가능합니다`,
      detail: "7일 이내 + 진도율 10% 미만인 경우만 환불 가능합니다"
    },
    { status: 400 }
  );
}
```

---

### 옵션 4: 제한 없음 (현재)

**규칙:**
- 언제든지, 진도율 상관없이 환불 가능
- 관리자가 수동으로 승인/거절

**장점:**
- 사용자 친화적
- 유연한 정책

**단점:**
- 악용 가능성 (강의 다 보고 환불)
- 관리자 부담 증가

---

## 추천 정책

### 개인 LMS (소규모)
**옵션 4 (제한 없음)** 권장
- 관리자가 직접 확인하므로 유연하게 대응 가능
- 신뢰 기반 운영

### 상업용 LMS (중대규모)
**옵션 3 (7일 + 10%)** 권장
- 자동화된 규칙으로 관리 효율 증가
- 악용 방지

---

## 구현 여부

현재는 **옵션 4 (제한 없음)** 상태입니다.

정책을 추가하고 싶으시면:
1. 원하는 옵션 번호 선택
2. 코드 수정 요청

**지금 추가할까요?**
- [ ] 옵션 1: 7일 제한
- [ ] 옵션 2: 진도율 10% 제한
- [ ] 옵션 3: 7일 + 10% 제한
- [ ] 옵션 4: 제한 없음 (현재 유지)
