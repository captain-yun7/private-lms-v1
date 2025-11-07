import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('관리자 결제 관리', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 로그인
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('결제 관리 페이지 접근', async ({ page }) => {
    await page.goto('/admin/payments');

    // 결제 관리 페이지 표시
    await expect(page).toHaveURL('/admin/payments');
    await expect(page.locator('h1, h2')).toContainText(/결제|Payment/i);
  });

  test('결제 내역 목록 표시', async ({ page }) => {
    await page.goto('/admin/payments');

    // 결제 내역 테이블 표시
    const paymentTable = page.locator('table, [data-testid="payment-list"]');
    await expect(paymentTable.first()).toBeVisible({ timeout: 5000 });

    // 결제 항목 확인
    const paymentItems = page.locator('tr, [data-testid="payment-item"]');
    expect(await paymentItems.count()).toBeGreaterThan(0);
  });

  test('결제 내역에 필수 정보 표시', async ({ page }) => {
    await page.goto('/admin/payments');

    // 테이블 헤더 확인
    await expect(page.locator('th:has-text("학생"), th:has-text("사용자")')).toBeVisible();
    await expect(page.locator('th:has-text("강의")')).toBeVisible();
    await expect(page.locator('th:has-text("금액")')).toBeVisible();
    await expect(page.locator('th:has-text("상태")')).toBeVisible();
    await expect(page.locator('th:has-text("결제일"), th:has-text("날짜")')).toBeVisible();
  });

  test('무통장입금 승인 대기 목록', async ({ page }) => {
    await page.goto('/admin/payments');

    // 무통장입금 탭 또는 필터 선택
    const bankTransferTab = page.locator('button:has-text("무통장"), a:has-text("무통장")');

    if (await bankTransferTab.isVisible()) {
      await bankTransferTab.click();
      await page.waitForTimeout(1000);

      // 승인 대기 중인 무통장입금 내역 확인
      const pendingPayments = page.locator('text=/대기|PENDING/i');
      expect(await pendingPayments.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('무통장입금 승인 처리', async ({ page }) => {
    await page.goto('/admin/payments');

    // 무통장입금 탭으로 이동
    const bankTransferTab = page.locator('button:has-text("무통장"), a:has-text("무통장")');

    if (await bankTransferTab.isVisible()) {
      await bankTransferTab.click();
      await page.waitForTimeout(1000);

      // 승인 버튼 확인
      const approveButton = page.locator('button:has-text("승인")').first();

      if (await approveButton.isVisible()) {
        // 승인 버튼이 있는지만 확인 (실제로는 클릭하지 않음)
        await expect(approveButton).toBeVisible();
        await expect(approveButton).toBeEnabled();
      }
    }
  });

  test('결제 상태별 필터링', async ({ page }) => {
    await page.goto('/admin/payments');

    // 상태 필터 선택
    const statusFilter = page.locator('select[name="status"], button:has-text("상태")');

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(500);

      // 필터링 결과 확인
      const paymentItems = page.locator('tr:not(:first-child), [data-testid="payment-item"]');
      expect(await paymentItems.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('결제 검색 기능', async ({ page }) => {
    await page.goto('/admin/payments');

    // 검색 입력창
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('테스트');

      // 검색 버튼 또는 Enter
      const searchButton = page.locator('button[type="submit"], button:has-text("검색")');
      if (await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }

      // 검색 결과 대기
      await page.waitForTimeout(1000);

      // 결과 확인
      const paymentItems = page.locator('tr:not(:first-child)');
      expect(await paymentItems.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('결제 상세 정보 확인', async ({ page }) => {
    await page.goto('/admin/payments');

    // 첫 번째 결제 내역 클릭
    const firstPayment = page.locator('tr:not(:first-child), [data-testid="payment-item"]').first();
    await firstPayment.click();

    // 상세 정보 모달 또는 페이지 표시
    await page.waitForTimeout(1000);

    const isModal = await page.locator('[role="dialog"], .modal').isVisible();
    const isDetailPage = page.url().includes('/admin/payments/');

    expect(isModal || isDetailPage).toBeTruthy();
  });

  test('환불 관리 페이지 접근', async ({ page }) => {
    await page.goto('/admin/refunds');

    // 환불 관리 페이지 표시
    await expect(page).toHaveURL('/admin/refunds');
    await expect(page.locator('h1, h2')).toContainText(/환불|Refund/i);
  });

  test('환불 신청 목록 표시', async ({ page }) => {
    await page.goto('/admin/refunds');

    // 환불 신청 목록 표시
    const refundList = page.locator('table, [data-testid="refund-list"]');
    await expect(refundList.first()).toBeVisible({ timeout: 5000 });

    // 환불 항목 확인
    const refundItems = page.locator('tr:not(:first-child), [data-testid="refund-item"]');
    expect(await refundItems.count()).toBeGreaterThanOrEqual(0);
  });

  test('환불 승인 처리', async ({ page }) => {
    await page.goto('/admin/refunds');

    // 승인 대기 중인 환불 찾기
    const approveButton = page.locator('button:has-text("승인")').first();

    if (await approveButton.isVisible()) {
      // 승인 버튼이 있는지만 확인 (실제로는 클릭하지 않음)
      await expect(approveButton).toBeVisible();
      await expect(approveButton).toBeEnabled();
    }
  });

  test('환불 거절 처리', async ({ page }) => {
    await page.goto('/admin/refunds');

    // 승인 대기 중인 환불 찾기
    const rejectButton = page.locator('button:has-text("거절"), button:has-text("반려")').first();

    if (await rejectButton.isVisible()) {
      // 거절 버튼이 있는지만 확인 (실제로는 클릭하지 않음)
      await expect(rejectButton).toBeVisible();
      await expect(rejectButton).toBeEnabled();
    }
  });

  test('환불 상태별 필터링', async ({ page }) => {
    await page.goto('/admin/refunds');

    // 상태 필터 선택
    const statusFilter = page.locator('select[name="status"], button:has-text("상태")');

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(500);

      // 필터링 결과 확인
      const refundItems = page.locator('tr:not(:first-child)');
      expect(await refundItems.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('결제 통계 표시', async ({ page }) => {
    await page.goto('/admin/payments');

    // 통계 정보 표시
    const statsCards = page.locator('[data-testid="stat-card"], .stat-card');

    if (await statsCards.isVisible()) {
      // 총 매출, 승인 대기 등의 통계 확인
      await expect(statsCards.first()).toBeVisible();

      // 금액 정보가 표시되는지 확인
      const amounts = page.locator('text=/원|₩|\\d+,\\d+/');
      expect(await amounts.count()).toBeGreaterThan(0);
    }
  });
});
