/**
 * E2E 테스트용 공통 데이터 및 헬퍼 함수
 */

export const testUsers = {
  student: {
    email: 'test.student@example.com',
    password: 'Test1234!',
    name: '테스트 학생',
  },
  admin: {
    email: 'admin@example.com',
    password: 'Admin1234!',
    name: '관리자',
  },
};

export const testCourse = {
  title: 'E2E 테스트 강의',
  description: 'Playwright E2E 테스트를 위한 강의입니다',
  price: 50000,
};

/**
 * 로그인 상태를 체크하고 로그인이 안되어 있으면 로그인
 */
export async function ensureLoggedIn(page: any, user: { email: string; password: string }) {
  // 홈으로 이동하여 로그인 상태 확인
  await page.goto('/');

  // 로그인 페이지로 리다이렉트되었는지 확인
  if (page.url().includes('/login')) {
    await page.fill('input[id="email"]', user.email);
    await page.fill('input[id="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }
}

/**
 * 로그아웃
 */
export async function logout(page: any) {
  await page.goto('/');
  const userMenu = page.locator('[data-testid="user-menu"]');
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.click('text=로그아웃');
  }
}

/**
 * 랜덤 이메일 생성
 */
export function generateRandomEmail() {
  const timestamp = Date.now();
  return `test.user.${timestamp}@example.com`;
}

/**
 * 테스트 환경 정리
 */
export async function cleanupTestData(page: any) {
  // 추후 필요시 테스트 데이터 정리 로직 추가
}
