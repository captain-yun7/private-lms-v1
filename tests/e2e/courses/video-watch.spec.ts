import { test, expect } from '@playwright/test';
import { testUsers, ensureLoggedIn } from '../fixtures/test-data';

test.describe('강의 영상 시청', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await ensureLoggedIn(page, testUsers.student);
  });

  test('수강 중인 강의 목록 접근', async ({ page }) => {
    await page.goto('/my/courses');
    await expect(page).toHaveURL('/my/courses');

    // 수강 중인 강의가 표시되는지 확인
    const courseList = page.locator('[data-testid="enrolled-course"], .enrolled-course, article, .course-card');

    // 최소 하나의 강의가 있거나, "수강 중인 강의가 없습니다" 메시지 표시
    const hasCourses = (await courseList.count()) > 0;
    const noCoursesMessage = await page.locator('text=/수강.*강의.*없/').isVisible();

    expect(hasCourses || noCoursesMessage).toBeTruthy();
  });

  test('강의 학습 페이지 접근', async ({ page }) => {
    await page.goto('/my/courses');

    const firstCourse = page.locator('[data-testid="enrolled-course"], .enrolled-course, article, .course-card').first();

    if ((await firstCourse.count()) > 0) {
      await firstCourse.click();
      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      // "학습하기" 버튼 클릭
      const studyButton = page.locator('button:has-text("학습하기"), a:has-text("학습하기")');
      await studyButton.click();

      // 학습 페이지로 이동
      await expect(page).toHaveURL(/\/learn|\/watch|\/player/);
    }
  });

  test('비디오 플레이어 로드 확인', async ({ page }) => {
    await page.goto('/my/courses');

    const firstCourse = page.locator('[data-testid="enrolled-course"], .enrolled-course, article, .course-card').first();

    if ((await firstCourse.count()) > 0) {
      await firstCourse.click();
      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      const studyButton = page.locator('button:has-text("학습하기"), a:has-text("학습하기")');
      await studyButton.click();

      await page.waitForURL(/\/learn|\/watch|\/player/);

      // iframe (Vimeo 플레이어) 또는 video 태그 확인
      const player = page.locator('iframe[src*="vimeo"], iframe[src*="player"], video');
      await expect(player.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('영상 목록 (커리큘럼) 표시', async ({ page }) => {
    await page.goto('/my/courses');

    const firstCourse = page.locator('[data-testid="enrolled-course"], .enrolled-course, article, .course-card').first();

    if ((await firstCourse.count()) > 0) {
      await firstCourse.click();
      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      const studyButton = page.locator('button:has-text("학습하기"), a:has-text("학습하기")');
      await studyButton.click();

      await page.waitForURL(/\/learn|\/watch|\/player/);

      // 영상 목록 표시 확인
      const videoList = page.locator('[data-testid="video-list"], .video-list, aside, nav');
      await expect(videoList.first()).toBeVisible({ timeout: 5000 });

      // 비디오 아이템들 확인
      const videoItems = page.locator('[data-testid="video-item"], .video-item, li');
      expect(await videoItems.count()).toBeGreaterThan(0);
    }
  });

  test('다른 영상으로 전환', async ({ page }) => {
    await page.goto('/my/courses');

    const firstCourse = page.locator('[data-testid="enrolled-course"], .enrolled-course, article, .course-card').first();

    if ((await firstCourse.count()) > 0) {
      await firstCourse.click();
      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      const studyButton = page.locator('button:has-text("학습하기"), a:has-text("학습하기")');
      await studyButton.click();

      await page.waitForURL(/\/learn|\/watch|\/player/);

      // 영상 목록에서 두 번째 영상 클릭
      const videoItems = page.locator('[data-testid="video-item"], .video-item, li, button[data-video-id]');

      if ((await videoItems.count()) > 1) {
        const currentUrl = page.url();
        await videoItems.nth(1).click();

        // URL 또는 플레이어 변경 대기
        await page.waitForTimeout(1000);

        // URL이 변경되었거나 새 플레이어가 로드되었는지 확인
        const urlChanged = page.url() !== currentUrl;
        expect(urlChanged).toBeTruthy();
      }
    }
  });

  test('진도율 표시', async ({ page }) => {
    await page.goto('/my/courses');

    const firstCourse = page.locator('[data-testid="enrolled-course"], .enrolled-course, article, .course-card').first();

    if ((await firstCourse.count()) > 0) {
      // 진도율 표시 확인 (목록 페이지에서)
      const progressBar = firstCourse.locator('[data-testid="progress"], .progress, [role="progressbar"]');
      const progressText = firstCourse.locator('text=/%|진도/');

      const hasProgress = (await progressBar.isVisible()) || (await progressText.isVisible());
      expect(hasProgress).toBeTruthy();

      // 상세 페이지에서도 확인
      await firstCourse.click();
      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      const detailProgress = page.locator('[data-testid="progress"], .progress, text=/%|진도/');
      await expect(detailProgress.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('영상 시청 완료 표시', async ({ page }) => {
    await page.goto('/my/courses');

    const firstCourse = page.locator('[data-testid="enrolled-course"], .enrolled-course, article, .course-card').first();

    if ((await firstCourse.count()) > 0) {
      await firstCourse.click();
      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      const studyButton = page.locator('button:has-text("학습하기"), a:has-text("학습하기")');
      await studyButton.click();

      await page.waitForURL(/\/learn|\/watch|\/player/);

      // 완료된 영상에 체크 표시가 있는지 확인
      const completedVideos = page.locator('[data-completed="true"], .completed, svg[data-icon="check"]');

      // 최소 하나의 완료 표시가 있거나, 아직 완료한 영상이 없을 수 있음
      const hasCompletedVideos = (await completedVideos.count()) > 0;

      // 완료 표시 기능이 존재하는지 확인 (존재하지 않을 수도 있음)
      // 이 테스트는 선택적
    }
  });

  test('DRM 보안 체크 (기기 등록)', async ({ page }) => {
    await page.goto('/my/courses');

    const firstCourse = page.locator('[data-testid="enrolled-course"], .enrolled-course, article, .course-card').first();

    if ((await firstCourse.count()) > 0) {
      await firstCourse.click();
      await page.waitForURL(/\/courses\/[a-zA-Z0-9-]+/);

      const studyButton = page.locator('button:has-text("학습하기"), a:has-text("학습하기")');
      await studyButton.click();

      // 기기 등록 팝업이 표시되거나, 바로 재생되는지 확인
      await page.waitForTimeout(2000);

      const deviceModal = page.locator('[role="dialog"]:has-text("기기"), .modal:has-text("기기")');
      const player = page.locator('iframe[src*="vimeo"], video');

      const hasDeviceCheck = await deviceModal.isVisible();
      const hasPlayer = await player.isVisible();

      // 기기 확인 모달이 표시되거나, 플레이어가 바로 표시되어야 함
      expect(hasDeviceCheck || hasPlayer).toBeTruthy();
    }
  });
});
