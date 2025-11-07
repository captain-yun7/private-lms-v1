# E2E 테스트 가이드

이 디렉토리에는 Playwright를 사용한 End-to-End (E2E) 테스트가 포함되어 있습니다.

## 디렉토리 구조

```
tests/e2e/
├── auth/                      # 인증 관련 테스트
│   └── login.spec.ts         # 로그인, 회원가입, 로그아웃
├── courses/                   # 강의 관련 테스트
│   ├── course-list.spec.ts   # 강의 목록, 검색, 필터링
│   └── video-watch.spec.ts   # 영상 시청, 진도율
├── purchase/                  # 구매 관련 테스트
│   ├── payment.spec.ts       # 결제 플로우
│   └── refund.spec.ts        # 환불 플로우
├── admin/                     # 관리자 관련 테스트
│   ├── admin-login.spec.ts   # 관리자 인증 및 권한
│   ├── course-management.spec.ts  # 강의 관리
│   └── payment-management.spec.ts # 결제/환불 관리
└── fixtures/                  # 테스트 데이터 및 헬퍼
    └── test-data.ts          # 공통 테스트 데이터
```

## 테스트 실행 방법

### 1. 기본 실행 (헤드리스 모드)

```bash
npm run test:e2e
```

모든 E2E 테스트를 헤드리스 모드로 실행합니다. 서버가 자동으로 시작되고, 테스트 완료 후 종료됩니다.

### 2. UI 모드 (권장)

```bash
npm run test:e2e:ui
```

Playwright의 UI 모드로 실행됩니다. 테스트를 시각적으로 확인하고 디버깅할 수 있습니다.

### 3. 브라우저 표시 모드

```bash
npm run test:e2e:headed
```

실제 브라우저 창을 띄워서 테스트를 실행합니다. 테스트 과정을 직접 볼 수 있습니다.

### 4. 디버그 모드

```bash
npm run test:e2e:debug
```

디버그 모드로 실행됩니다. 브레이크포인트를 설정하고 단계별로 실행할 수 있습니다.

### 5. 테스트 리포트 확인

```bash
npm run test:e2e:report
```

이전 테스트 실행 결과의 HTML 리포트를 엽니다.

## 특정 테스트만 실행하기

### 특정 파일 실행

```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### 특정 테스트 케이스 실행

```bash
npx playwright test -g "로그인"
```

### 특정 브라우저에서만 실행

```bash
npx playwright test --project=chromium
npx playwright test --project=mobile-chrome
```

## 테스트 작성 시 주의사항

### 1. 테스트 데이터

`fixtures/test-data.ts`에 정의된 테스트 계정을 사용하세요:

```typescript
testUsers.student  // 일반 학생 계정
testUsers.admin    // 관리자 계정
```

### 2. 로그인 헬퍼

로그인이 필요한 테스트에서는 `ensureLoggedIn` 헬퍼를 사용하세요:

```typescript
import { ensureLoggedIn, testUsers } from '../fixtures/test-data';

test.beforeEach(async ({ page }) => {
  await ensureLoggedIn(page, testUsers.student);
});
```

### 3. 비파괴적 테스트

실제 데이터를 수정하거나 삭제하는 테스트는 작성하지 마세요. 대신:

- 버튼의 존재 여부만 확인
- 폼 입력은 하되 제출하지 않음
- 확인 다이얼로그가 표시되는지만 확인

### 4. 유연한 선택자

UI가 변경될 수 있으므로 유연한 선택자를 사용하세요:

```typescript
// ✅ 좋은 예
page.locator('button:has-text("로그인"), button:has-text("Sign in")')

// ❌ 나쁜 예
page.locator('button.btn-primary.login-button')
```

## 환경 설정

### 테스트 환경 변수

필요한 경우 `.env.test` 파일을 생성하여 테스트 전용 환경 변수를 설정할 수 있습니다.

### 데이터베이스

테스트는 개발 데이터베이스를 사용합니다. 별도의 테스트 데이터베이스를 사용하려면:

1. `.env.test` 파일 생성
2. `DATABASE_URL` 설정
3. `playwright.config.ts`에서 환경 변수 로드

## 트러블슈팅

### 포트 충돌

이미 `localhost:3000`에서 다른 서버가 실행 중이라면:

```bash
# 기존 서버 종료 후
npm run test:e2e
```

또는 `playwright.config.ts`에서 `reuseExistingServer: true` 설정이 되어 있으므로 기존 서버를 그대로 사용합니다.

### 타임아웃 에러

네트워크나 서버가 느린 경우 타임아웃을 늘리세요:

```typescript
await expect(element).toBeVisible({ timeout: 10000 }); // 10초
```

### 브라우저 설치 문제

Chromium이 설치되지 않았다면:

```bash
npx playwright install chromium
```

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
