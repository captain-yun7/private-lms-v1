/**
 * 토스페이먼츠 PG 심사용 테스트 계정 생성 스크립트
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_ACCOUNT = {
  name: '토스페이먼츠 심사용',
  email: 'test@shipedu.kr',
  password: 'test1234!',
};

async function createTestAccount() {
  try {
    // 기존 계정 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_ACCOUNT.email },
    });

    if (existingUser) {
      console.log('이미 테스트 계정이 존재합니다.');
      console.log('================================');
      console.log(`이메일: ${TEST_ACCOUNT.email}`);
      console.log(`비밀번호: ${TEST_ACCOUNT.password}`);
      console.log('================================');
      return;
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(TEST_ACCOUNT.password, 10);

    // 계정 생성
    const user = await prisma.user.create({
      data: {
        name: TEST_ACCOUNT.name,
        email: TEST_ACCOUNT.email,
        password: hashedPassword,
        role: 'STUDENT',
      },
    });

    console.log('테스트 계정이 생성되었습니다!');
    console.log('================================');
    console.log(`이메일: ${TEST_ACCOUNT.email}`);
    console.log(`비밀번호: ${TEST_ACCOUNT.password}`);
    console.log('================================');
    console.log(`User ID: ${user.id}`);

  } catch (error) {
    console.error('계정 생성 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAccount();
