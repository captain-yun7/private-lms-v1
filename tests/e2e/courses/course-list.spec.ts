import { test, expect } from '@playwright/test';
import { testUsers, ensureLoggedIn } from '../fixtures/test-data';

test.describe('강의 목록 및 상세', () => {
  test('강의 목록 페이지 접근', async ({ page }) => {
    await page.goto('/courses');
    await expect(page).toHaveURL('/courses');

    // 강의 목록이 표시되는지 확인
    const courseCards = page.locator('[data-testid="course-card"], .course-card, article');
    await expect(courseCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('강의 카드에 필수 정보 표시', async ({ page }) => {
    await page.goto('/courses');

    // 첫 번째 강의 카드 선택
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, article').first();
    await firstCourse.waitFor({ state: 'visible' });

    // 강의 제목이 있는지 확인
    const title = firstCourse.locator('h2, h3, h4, [class*="title"]');
    await expect(title).toBeVisible();

    // 가격 정보가 있는지 확인
    const price = firstCourse.locator('text=/원|₩|,/');
    await expect(price).toBeVisible();
  });

  test('강의 상세 페이지 접근', async ({ page }) => {
    await page.goto('/courses');

    // 첫 번째 강의 클릭
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, article').first();
    await firstCourse.click();

    // URL이 /courses/[id] 형태로 변경되는지 확인
    await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9-]+/);

    // 강의 상세 정보가 표시되는지 확인
    await expect(page.locator('h1')).toBeVisible();
  });

  test('강의 상세 페이지에 필수 정보 표시', async ({ page }) => {
    await page.goto('/courses');
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, article').first();
    await firstCourse.click();

    await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

    // 강의 제목
    await expect(page.locator('h1')).toBeVisible();

    // 강의 설명
    await expect(page.locator('[data-testid="course-description"], p, div[class*="description"]')).toBeVisible();

    // 가격 정보
    await expect(page.locator('text=/원|₩/')).toBeVisible();

    // 수강신청 또는 학습하기 버튼
    const enrollButton = page.locator('button:has-text("수강신청"), button:has-text("구매하기"), button:has-text("학습하기"), a:has-text("수강신청")');
    await expect(enrollButton.first()).toBeVisible();
  });

  test('강의 검색 기능', async ({ page }) => {
    await page.goto('/courses');

    // 검색창이 있는지 확인
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]');

    if (await searchInput.isVisible()) {
      // 검색어 입력
      await searchInput.fill('테스트');

      // 검색 버튼 클릭 또는 Enter
      const searchButton = page.locator('button[type="submit"], button:has-text("검색")');
      if (await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }

      // 검색 결과 대기
      await page.waitForTimeout(1000);

      // URL 또는 컨텐츠 변경 확인
      await expect(page).toHaveURL(/search|query|q=/);
    }
  });

  test('강의 카테고리 필터링', async ({ page }) => {
    await page.goto('/courses');

    // 카테고리 필터가 있는지 확인
    const categoryFilter = page.locator('[data-testid="category-filter"], select, button:has-text("카테고리")');

    if (await categoryFilter.isVisible()) {
      // 카테고리 선택
      await categoryFilter.first().click();
      await page.waitForTimeout(500);

      // 필터링 결과 확인
      const courseCards = page.locator('[data-testid="course-card"], .course-card, article');
      await expect(courseCards.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('로그인 후 강의 상세 페이지 수강신청 버튼 동작', async ({ page }) => {
    // 로그인
    await ensureLoggedIn(page, testUsers.student);

    await page.goto('/courses');
    const firstCourse = page.locator('[data-testid="course-card"], .course-card, article').first();
    await firstCourse.click();

    await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

    // 수강신청 또는 구매하기 버튼 클릭
    const enrollButton = page.locator('button:has-text("수강신청"), button:has-text("구매하기")');

    if (await enrollButton.isVisible()) {
      await enrollButton.click();

      // 결제 페이지로 이동하거나 모달이 표시되는지 확인
      await page.waitForTimeout(1000);

      const isPaymentPage = page.url().includes('/payment') || page.url().includes('/checkout');
      const isModal = await page.locator('[role="dialog"], .modal').isVisible();

      expect(isPaymentPage || isModal).toBeTruthy();
    }
  });

  test('수강 중인 강의는 "학습하기" 버튼 표시', async ({ page }) => {
    // 로그인
    await ensureLoggedIn(page, testUsers.student);

    await page.goto('/my/courses');

    // 수강 중인 강의가 있는지 확인
    const myCourses = page.locator('[data-testid="enrolled-course"], .enrolled-course, article');

    if ((await myCourses.count()) > 0) {
      // 첫 번째 수강 중인 강의로 이동
      await myCourses.first().click();

      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      // "학습하기" 버튼이 표시되는지 확인
      const studyButton = page.locator('button:has-text("학습하기"), a:has-text("학습하기")');
      await expect(studyButton).toBeVisible({ timeout: 5000 });
    }
  });
});
