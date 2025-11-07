import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('관리자 인증 및 접근', () => {
  test('관리자 로그인', async ({ page }) => {
    await page.goto('/login');

    // 관리자 계정으로 로그인
    await page.fill('input[id="email"]', testUsers.admin.email);
    await page.fill('input[id="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');

    // 로그인 성공 확인
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('관리자 페이지 접근', async ({ page }) => {
    // 관리자 로그인
    await page.goto('/login');
    await page.fill('input[id="email"]', testUsers.admin.email);
    await page.fill('input[id="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 관리자 페이지로 이동
    await page.goto('/admin');

    // 관리자 대시보드 표시 확인
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h1, h2')).toContainText(/대시보드|Dashboard|관리자/i);
  });

  test('일반 사용자는 관리자 페이지 접근 불가', async ({ page }) => {
    // 일반 학생 계정으로 로그인
    await page.goto('/login');
    await page.fill('input[id="email"]', testUsers.student.email);
    await page.fill('input[id="password"]', testUsers.student.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 관리자 페이지 접근 시도
    await page.goto('/admin');

    // 접근 거부 또는 홈으로 리다이렉트
    await page.waitForTimeout(1000);

    const isRedirected = !page.url().includes('/admin');
    const hasForbiddenMessage = await page.locator('text=/권한|접근.*거부|403/i').isVisible();

    expect(isRedirected || hasForbiddenMessage).toBeTruthy();
  });

  test('관리자 대시보드 통계 표시', async ({ page }) => {
    // 관리자 로그인
    await page.goto('/login');
    await page.fill('input[id="email"]', testUsers.admin.email);
    await page.fill('input[id="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 대시보드로 이동
    await page.goto('/admin');

    // 통계 카드 확인
    const statsCards = page.locator('[data-testid="stat-card"], .stat-card, [class*="stats"]');
    await expect(statsCards.first()).toBeVisible({ timeout: 5000 });

    // 숫자 형태의 통계 정보가 표시되는지 확인
    const numbers = page.locator('text=/\\d+|[0-9]/');
    expect(await numbers.count()).toBeGreaterThan(0);
  });

  test('관리자 사이드바 메뉴 표시', async ({ page }) => {
    // 관리자 로그인
    await page.goto('/login');
    await page.fill('input[id="email"]', testUsers.admin.email);
    await page.fill('input[id="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 대시보드로 이동
    await page.goto('/admin');

    // 사이드바 메뉴 확인
    const sidebar = page.locator('[data-testid="admin-sidebar"], aside, nav');
    await expect(sidebar.first()).toBeVisible();

    // 주요 메뉴 항목 확인
    const menuItems = [
      /대시보드|Dashboard/i,
      /강의|Course/i,
      /학생|Student|회원|User/i,
      /결제|Payment/i,
      /환불|Refund/i,
    ];

    for (const menuItem of menuItems) {
      const menu = page.locator(`text=${menuItem}`);
      await expect(menu.first()).toBeVisible();
    }
  });
});
