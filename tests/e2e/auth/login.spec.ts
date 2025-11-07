import { test, expect } from '@playwright/test';
import { testUsers, generateRandomEmail } from '../fixtures/test-data';

test.describe('인증 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('로그인 페이지 접근', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=계정에 로그인하세요')).toBeVisible();
    await expect(page.locator('h1:has-text("Private LMS")')).toBeVisible();
  });

  test('이메일 로그인 성공', async ({ page }) => {
    await page.goto('/login');

    // 이메일 입력
    await page.fill('input[id="email"]', testUsers.student.email);
    await page.fill('input[id="password"]', testUsers.student.password);

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 로그인 후 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/dashboard');
  });

  test('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', testUsers.student.email);
    await page.fill('input[id="password"]', 'WrongPassword123!');

    await page.click('button[type="submit"]');

    // 에러 메시지 표시 확인
    await expect(page.locator('text=/이메일.*비밀번호.*올바르지/i')).toBeVisible({ timeout: 5000 });
  });

  test('회원가입 페이지 접근', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL('/signup');
  });

  test('소셜 로그인 버튼 표시', async ({ page }) => {
    await page.goto('/login');

    // Google, Kakao, Naver 로그인 버튼 확인
    const googleButton = page.locator('button:has-text("Google")');
    const kakaoButton = page.locator('button:has-text("카카오")');
    const naverButton = page.locator('button:has-text("네이버")');

    // 소셜 로그인 버튼들이 표시되는지 확인
    await expect(googleButton).toBeVisible();
    await expect(kakaoButton).toBeVisible();
    await expect(naverButton).toBeVisible();
  });

  test('로그인 페이지 회원가입 링크', async ({ page }) => {
    await page.goto('/login');

    // 회원가입 링크 클릭
    const signupLink = page.locator('a:has-text("회원가입")');
    await expect(signupLink).toBeVisible();
    await signupLink.click();

    // 회원가입 페이지로 이동 확인
    await expect(page).toHaveURL('/signup');
  });
});
