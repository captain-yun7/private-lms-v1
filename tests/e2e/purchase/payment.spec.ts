import { test, expect } from '@playwright/test';
import { testUsers, ensureLoggedIn } from '../fixtures/test-data';

test.describe('강의 구매 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await ensureLoggedIn(page, testUsers.student);
  });

  test('강의 구매하기 버튼 클릭', async ({ page }) => {
    await page.goto('/courses');

    // 아직 수강하지 않은 강의 찾기
    const courseCards = page.locator('[data-testid="course-card"], .course-card, article');
    await courseCards.first().click();

    await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

    // 수강신청/구매하기 버튼 클릭
    const purchaseButton = page.locator('button:has-text("수강신청"), button:has-text("구매하기")');

    if (await purchaseButton.isVisible()) {
      await purchaseButton.click();

      // 결제 페이지 또는 모달로 이동
      await page.waitForTimeout(1000);

      const isPaymentPage = page.url().includes('/payment') || page.url().includes('/checkout');
      const isModal = await page.locator('[role="dialog"], .modal').isVisible();

      expect(isPaymentPage || isModal).toBeTruthy();
    }
  });

  test('결제 페이지에 강의 정보 표시', async ({ page }) => {
    await page.goto('/courses');

    const courseCards = page.locator('[data-testid="course-card"], .course-card, article');
    await courseCards.first().click();

    await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

    const purchaseButton = page.locator('button:has-text("수강신청"), button:has-text("구매하기")');

    if (await purchaseButton.isVisible()) {
      await purchaseButton.click();
      await page.waitForTimeout(1000);

      // 강의 제목이 표시되는지 확인
      const courseTitle = page.locator('h1, h2, h3, [data-testid="course-title"]');
      await expect(courseTitle.first()).toBeVisible({ timeout: 5000 });

      // 가격 정보가 표시되는지 확인
      const priceInfo = page.locator('text=/원|₩|,/');
      await expect(priceInfo.first()).toBeVisible();
    }
  });

  test('결제 수단 선택 옵션 표시', async ({ page }) => {
    await page.goto('/courses');

    const courseCards = page.locator('[data-testid="course-card"], .course-card, article');
    await courseCards.first().click();

    await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

    const purchaseButton = page.locator('button:has-text("수강신청"), button:has-text("구매하기")');

    if (await purchaseButton.isVisible()) {
      await purchaseButton.click();
      await page.waitForTimeout(1000);

      // 카드 결제 옵션
      const cardOption = page.locator('input[value="CARD"], button:has-text("카드"), text=카드');
      const bankTransferOption = page.locator('input[value="BANK_TRANSFER"], button:has-text("무통장"), text=무통장');

      // 최소 하나의 결제 수단이 표시되어야 함
      const hasCardOption = await cardOption.isVisible();
      const hasBankTransferOption = await bankTransferOption.isVisible();

      expect(hasCardOption || hasBankTransferOption).toBeTruthy();
    }
  });

  test('카드 결제 선택 시 TossPayments 연동', async ({ page }) => {
    await page.goto('/courses');

    const courseCards = page.locator('[data-testid="course-card"], .course-card, article');
    await courseCards.first().click();

    await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

    const purchaseButton = page.locator('button:has-text("수강신청"), button:has-text("구매하기")');

    if (await purchaseButton.isVisible()) {
      await purchaseButton.click();
      await page.waitForTimeout(1000);

      // 카드 결제 선택
      const cardOption = page.locator('input[value="CARD"], button:has-text("카드")');

      if (await cardOption.isVisible()) {
        await cardOption.click();

        // 결제하기 버튼 클릭
        const payButton = page.locator('button:has-text("결제하기"), button[type="submit"]');
        await payButton.click();

        // TossPayments 창이 열리거나 리다이렉트되는지 확인
        await page.waitForTimeout(2000);

        // 새 창이 열리거나 URL이 변경됨
        const isTossPage = page.url().includes('tosspayments') || page.url().includes('payment');
        expect(isTossPage).toBeTruthy();
      }
    }
  });

  test('무통장입금 선택 시 입금 정보 표시', async ({ page }) => {
    await page.goto('/courses');

    const courseCards = page.locator('[data-testid="course-card"], .course-card, article');
    await courseCards.first().click();

    await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

    const purchaseButton = page.locator('button:has-text("수강신청"), button:has-text("구매하기")');

    if (await purchaseButton.isVisible()) {
      await purchaseButton.click();
      await page.waitForTimeout(1000);

      // 무통장입금 선택
      const bankTransferOption = page.locator('input[value="BANK_TRANSFER"], button:has-text("무통장")');

      if (await bankTransferOption.isVisible()) {
        await bankTransferOption.click();
        await page.waitForTimeout(500);

        // 입금 정보가 표시되는지 확인
        const bankInfo = page.locator('text=/계좌|입금|은행/');
        await expect(bankInfo.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('이미 구매한 강의는 재구매 불가', async ({ page }) => {
    await page.goto('/my/courses');

    const enrolledCourses = page.locator('[data-testid="enrolled-course"], .enrolled-course, article');

    if ((await enrolledCourses.count()) > 0) {
      // 첫 번째 수강 중인 강의 클릭
      await enrolledCourses.first().click();
      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      // "수강신청" 또는 "구매하기" 버튼이 없어야 함
      const purchaseButton = page.locator('button:has-text("수강신청"), button:has-text("구매하기")');
      expect(await purchaseButton.isVisible()).toBeFalsy();

      // 대신 "학습하기" 버튼이 표시되어야 함
      const studyButton = page.locator('button:has-text("학습하기"), a:has-text("학습하기")');
      await expect(studyButton).toBeVisible();
    }
  });

  test('구매 내역 페이지 접근', async ({ page }) => {
    await page.goto('/my/purchases');

    // 구매 내역 페이지 표시 확인
    await expect(page).toHaveURL('/my/purchases');
    await expect(page.locator('h1, h2')).toContainText(/구매|결제|주문/);
  });

  test('구매 내역 목록 표시', async ({ page }) => {
    await page.goto('/my/purchases');

    // 구매 내역이 있거나, "구매 내역이 없습니다" 메시지 표시
    const purchaseItems = page.locator('[data-testid="purchase-item"], .purchase-item, tr, article');
    const noPurchasesMessage = page.locator('text=/구매.*내역.*없/');

    const hasPurchases = (await purchaseItems.count()) > 0;
    const hasNoMessage = await noPurchasesMessage.isVisible();

    expect(hasPurchases || hasNoMessage).toBeTruthy();

    if (hasPurchases) {
      // 첫 번째 구매 내역에 필수 정보 표시 확인
      const firstPurchase = purchaseItems.first();

      // 강의명
      await expect(firstPurchase.locator('text=/강의|코스|course/i')).toBeVisible();

      // 금액
      await expect(firstPurchase.locator('text=/원|₩|,/')).toBeVisible();

      // 상태
      await expect(firstPurchase.locator('text=/완료|대기|취소|승인/i')).toBeVisible();
    }
  });
});
