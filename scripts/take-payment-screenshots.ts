/**
 * 토스페이먼츠 PG 심사용 결제 경로 스크린샷 촬영 스크립트
 *
 * 실행 방법 (Windows PowerShell에서):
 *   cd C:\path\to\private-lms-v1
 *   npx playwright install chromium
 *   npx tsx scripts/take-payment-screenshots.ts
 *
 * 결과물: ./screenshots-payment-flow/ 폴더에 PNG 파일 저장
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://shipedu.vercel.app';
const COURSE_ID = 'cmgyqdgcy00037hxo5nsc4xpz';

async function takeScreenshots() {
  const outputDir = path.join(process.cwd(), 'screenshots-payment-flow');

  // 출력 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ko-KR',
  });
  const page = await context.newPage();

  console.log('스크린샷 촬영 시작...\n');

  try {
    // 1. 메인 페이지
    console.log('1. 메인 페이지 촬영 중...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, '01-main-page.png'),
      fullPage: false
    });
    console.log('   ✓ 01-main-page.png 저장됨\n');

    // 2. 강의 목록 페이지
    console.log('2. 강의 목록 페이지 촬영 중...');
    await page.goto(`${BASE_URL}/courses`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, '02-courses-list.png'),
      fullPage: false
    });
    console.log('   ✓ 02-courses-list.png 저장됨\n');

    // 3. 강의 상세 페이지
    console.log('3. 강의 상세 페이지 촬영 중...');
    await page.goto(`${BASE_URL}/courses/${COURSE_ID}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, '03-course-detail.png'),
      fullPage: false
    });
    console.log('   ✓ 03-course-detail.png 저장됨\n');

    // 4. 결제 페이지 (로그인 필요 - 로그인 페이지로 리다이렉트됨)
    console.log('4. 로그인 페이지 촬영 중...');
    await page.goto(`${BASE_URL}/checkout/${COURSE_ID}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, '04-login-page.png'),
      fullPage: false
    });
    console.log('   ✓ 04-login-page.png 저장됨\n');

    // 5. 환불 정책 페이지
    console.log('5. 환불 정책 페이지 촬영 중...');
    await page.goto(`${BASE_URL}/refund-policy`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, '05-refund-policy.png'),
      fullPage: true
    });
    console.log('   ✓ 05-refund-policy.png 저장됨\n');

    // 6. 이용약관 페이지
    console.log('6. 이용약관 페이지 촬영 중...');
    await page.goto(`${BASE_URL}/terms`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, '06-terms.png'),
      fullPage: false
    });
    console.log('   ✓ 06-terms.png 저장됨\n');

    // 7. 개인정보처리방침 페이지
    console.log('7. 개인정보처리방침 페이지 촬영 중...');
    await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, '07-privacy.png'),
      fullPage: false
    });
    console.log('   ✓ 07-privacy.png 저장됨\n');

    console.log('========================================');
    console.log(`모든 스크린샷이 저장되었습니다!`);
    console.log(`저장 위치: ${outputDir}`);
    console.log('========================================\n');
    console.log('※ 결제 페이지 스크린샷은 로그인이 필요합니다.');
    console.log('  직접 로그인 후 결제 페이지와 토스페이먼츠 결제창을 캡처해주세요.');

  } catch (error) {
    console.error('스크린샷 촬영 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
