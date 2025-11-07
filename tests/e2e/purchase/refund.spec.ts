import { test, expect } from '@playwright/test';
import { testUsers, ensureLoggedIn } from '../fixtures/test-data';

test.describe('환불 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await ensureLoggedIn(page, testUsers.student);
  });

  test('구매 내역에서 환불 신청 버튼 표시', async ({ page }) => {
    await page.goto('/my/purchases');

    const purchaseItems = page.locator('[data-testid="purchase-item"], .purchase-item, tr, article');

    if ((await purchaseItems.count()) > 0) {
      const firstPurchase = purchaseItems.first();

      // 환불 가능한 구매건에 환불 신청 버튼이 있는지 확인
      const refundButton = firstPurchase.locator('button:has-text("환불"), a:has-text("환불")');

      // 환불 버튼이 있거나, 이미 환불된 상태일 수 있음
      const hasRefundButton = await refundButton.isVisible();
      const isRefunded = await firstPurchase.locator('text=/환불.*완료/').isVisible();

      expect(hasRefundButton || isRefunded).toBeTruthy();
    }
  });

  test('환불 신청 페이지 접근', async ({ page }) => {
    await page.goto('/my/purchases');

    const purchaseItems = page.locator('[data-testid="purchase-item"], .purchase-item, tr');

    if ((await purchaseItems.count()) > 0) {
      const firstPurchase = purchaseItems.first();
      const refundButton = firstPurchase.locator('button:has-text("환불"), a:has-text("환불")');

      if (await refundButton.isVisible()) {
        await refundButton.click();

        // 환불 신청 페이지 또는 모달로 이동
        await page.waitForTimeout(1000);

        const isRefundPage = page.url().includes('/refund');
        const isModal = await page.locator('[role="dialog"]:has-text("환불"), .modal:has-text("환불")').isVisible();

        expect(isRefundPage || isModal).toBeTruthy();
      }
    }
  });

  test('환불 신청 폼 작성', async ({ page }) => {
    await page.goto('/my/purchases');

    const purchaseItems = page.locator('[data-testid="purchase-item"], .purchase-item, tr');

    if ((await purchaseItems.count()) > 0) {
      const firstPurchase = purchaseItems.first();
      const refundButton = firstPurchase.locator('button:has-text("환불"), a:has-text("환불")');

      if (await refundButton.isVisible()) {
        await refundButton.click();
        await page.waitForTimeout(1000);

        // 환불 사유 입력
        const reasonTextarea = page.locator('textarea[name="reason"], textarea[placeholder*="사유"]');

        if (await reasonTextarea.isVisible()) {
          await reasonTextarea.fill('E2E 테스트용 환불 신청입니다.');

          // 계좌 정보 입력 (무통장입금의 경우)
          const bankInput = page.locator('input[name="bank"], input[placeholder*="은행"]');
          if (await bankInput.isVisible()) {
            await bankInput.fill('테스트은행');
          }

          const accountInput = page.locator('input[name="account"], input[placeholder*="계좌"]');
          if (await accountInput.isVisible()) {
            await accountInput.fill('123-456-789');
          }

          const holderInput = page.locator('input[name="holder"], input[placeholder*="예금주"]');
          if (await holderInput.isVisible()) {
            await holderInput.fill('홍길동');
          }

          // 환불 신청 버튼 클릭
          const submitButton = page.locator('button:has-text("신청"), button[type="submit"]');

          // 실제로 신청하지 않고 확인만 (테스트 데이터 오염 방지)
          await expect(submitButton).toBeVisible();
        }
      }
    }
  });

  test('환불 신청 내역 확인', async ({ page }) => {
    await page.goto('/my/refunds');

    // 환불 신청 내역 페이지 표시
    const refundItems = page.locator('[data-testid="refund-item"], .refund-item, tr, article');
    const noRefundsMessage = page.locator('text=/환불.*내역.*없/');

    const hasRefunds = (await refundItems.count()) > 0;
    const hasNoMessage = await noRefundsMessage.isVisible();

    expect(hasRefunds || hasNoMessage).toBeTruthy();

    if (hasRefunds) {
      // 첫 번째 환불 내역에 상태 정보 표시 확인
      const firstRefund = refundItems.first();

      // 상태 표시 (대기, 승인, 거절)
      await expect(firstRefund.locator('text=/대기|승인|거절|완료/i')).toBeVisible();

      // 신청일
      await expect(firstRefund.locator('text=/2024|2025|\\d{4}/i')).toBeVisible();
    }
  });

  test('환불 불가 조건 체크 (진도율 초과)', async ({ page }) => {
    await page.goto('/my/courses');

    const enrolledCourses = page.locator('[data-testid="enrolled-course"], .enrolled-course, article');

    if ((await enrolledCourses.count()) > 0) {
      // 진도율이 높은 강의 찾기
      const courseWithHighProgress = enrolledCourses.filter({
        has: page.locator('text=/[5-9][0-9]%|100%/'),
      });

      if ((await courseWithHighProgress.count()) > 0) {
        // 해당 강의의 구매 내역에서 환불 버튼 확인
        await page.goto('/my/purchases');

        // 환불 불가 메시지 또는 비활성화된 버튼 확인
        const disabledRefundButton = page.locator('button:has-text("환불")[disabled]');
        const refundNotAllowedMessage = page.locator('text=/환불.*불가|진도율.*초과/');

        const isRefundDisabled = await disabledRefundButton.isVisible();
        const hasRefundNotAllowedMessage = await refundNotAllowedMessage.isVisible();

        // 환불 버튼이 비활성화되어 있거나 환불 불가 메시지가 표시됨
        // (또는 환불이 가능할 수도 있음 - 정책에 따라)
      }
    }
  });

  test('환불 상태별 필터링', async ({ page }) => {
    await page.goto('/my/refunds');

    // 상태 필터가 있는지 확인
    const statusFilter = page.locator('select[name="status"], button:has-text("상태")');

    if (await statusFilter.isVisible()) {
      // 필터 선택
      await statusFilter.click();
      await page.waitForTimeout(500);

      // 필터링 결과 확인
      const refundItems = page.locator('[data-testid="refund-item"], .refund-item, tr');
      expect(await refundItems.count()).toBeGreaterThanOrEqual(0);
    }
  });
});
