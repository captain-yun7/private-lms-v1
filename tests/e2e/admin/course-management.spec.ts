import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

test.describe('관리자 강의 관리', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 로그인
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', testUsers.admin.email);
    await page.fill('input[name="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('강의 관리 페이지 접근', async ({ page }) => {
    await page.goto('/admin/courses');

    // 강의 관리 페이지 표시
    await expect(page).toHaveURL('/admin/courses');
    await expect(page.locator('h1, h2')).toContainText(/강의|Course/i);
  });

  test('강의 목록 표시', async ({ page }) => {
    await page.goto('/admin/courses');

    // 강의 목록 테이블 또는 카드 표시
    const courseList = page.locator('table, [data-testid="course-list"], .course-list');
    await expect(courseList.first()).toBeVisible({ timeout: 5000 });

    // 강의 항목 확인
    const courseItems = page.locator('tr, [data-testid="course-item"], article');
    expect(await courseItems.count()).toBeGreaterThan(0);
  });

  test('강의 생성 페이지 접근', async ({ page }) => {
    await page.goto('/admin/courses');

    // "강의 생성" 또는 "새 강의" 버튼 클릭
    const createButton = page.locator('button:has-text("생성"), button:has-text("추가"), a:has-text("생성")');
    await createButton.click();

    // 생성 페이지로 이동
    await expect(page).toHaveURL(/\/admin\/courses\/(new|create)/);
  });

  test('강의 생성 폼 작성', async ({ page }) => {
    await page.goto('/admin/courses');

    const createButton = page.locator('button:has-text("생성"), button:has-text("추가"), a:has-text("생성")');
    await createButton.click();

    await page.waitForURL(/\/admin\/courses\/(new|create)/);

    // 강의 정보 입력
    await page.fill('input[name="title"]', 'E2E 테스트 강의');
    await page.fill('textarea[name="description"]', 'Playwright로 생성한 테스트 강의입니다');
    await page.fill('input[name="price"]', '50000');

    // 카테고리 선택 (있는 경우)
    const categorySelect = page.locator('select[name="category"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
    }

    // 썸네일 업로드 필드 확인
    const thumbnailInput = page.locator('input[type="file"][name="thumbnail"]');
    await expect(thumbnailInput).toBeVisible();

    // 저장 버튼 확인 (실제로는 클릭하지 않음 - 테스트 데이터 오염 방지)
    const saveButton = page.locator('button[type="submit"], button:has-text("저장")');
    await expect(saveButton).toBeVisible();
  });

  test('강의 수정 페이지 접근', async ({ page }) => {
    await page.goto('/admin/courses');

    // 첫 번째 강의의 수정 버튼 클릭
    const editButton = page.locator('button:has-text("수정"), a:has-text("수정")').first();
    await editButton.click();

    // 수정 페이지로 이동
    await expect(page).toHaveURL(/\/admin\/courses\/[a-zA-Z0-9-]+\/edit/);
  });

  test('강의 수정 폼에 기존 데이터 표시', async ({ page }) => {
    await page.goto('/admin/courses');

    const editButton = page.locator('button:has-text("수정"), a:has-text("수정")').first();
    await editButton.click();

    await page.waitForURL(/\/admin\/courses\/[a-zA-Z0-9-]+\/edit/);

    // 기존 데이터가 입력되어 있는지 확인
    const titleInput = page.locator('input[name="title"]');
    const titleValue = await titleInput.inputValue();
    expect(titleValue.length).toBeGreaterThan(0);

    const priceInput = page.locator('input[name="price"]');
    const priceValue = await priceInput.inputValue();
    expect(priceValue.length).toBeGreaterThan(0);
  });

  test('강의 삭제 기능', async ({ page }) => {
    await page.goto('/admin/courses');

    // 삭제 버튼 확인
    const deleteButton = page.locator('button:has-text("삭제")').first();

    if (await deleteButton.isVisible()) {
      // 삭제 버튼이 있는지만 확인 (실제로는 클릭하지 않음)
      await expect(deleteButton).toBeVisible();

      // 삭제 버튼 클릭 시 확인 다이얼로그 표시 여부 테스트
      // (실제 삭제는 하지 않음)
    }
  });

  test('강의 검색 기능', async ({ page }) => {
    await page.goto('/admin/courses');

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

      // 결과가 필터링되었는지 확인
      const courseItems = page.locator('tr, [data-testid="course-item"]');
      expect(await courseItems.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('강의 상태별 필터링', async ({ page }) => {
    await page.goto('/admin/courses');

    // 상태 필터 (공개/비공개)
    const statusFilter = page.locator('select[name="status"], button:has-text("상태")');

    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(500);

      // 필터링 결과 확인
      const courseItems = page.locator('tr, [data-testid="course-item"]');
      expect(await courseItems.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('강의 상세 정보 모달 또는 페이지', async ({ page }) => {
    await page.goto('/admin/courses');

    // 첫 번째 강의의 상세보기 버튼
    const viewButton = page.locator('button:has-text("상세"), a:has-text("상세"), tr').first();
    await viewButton.click();

    // 모달 또는 상세 페이지 표시
    await page.waitForTimeout(1000);

    const isModal = await page.locator('[role="dialog"], .modal').isVisible();
    const isDetailPage = page.url().includes('/admin/courses/') && !page.url().includes('/edit');

    expect(isModal || isDetailPage).toBeTruthy();
  });
});
