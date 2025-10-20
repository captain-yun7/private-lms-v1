// PENDING 상태의 Purchase와 Payment 삭제 스크립트
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 PENDING 상태의 Purchase 정리 시작...');

  // PENDING 상태의 Purchase 찾기
  const pendingPurchases = await prisma.purchase.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      payment: true,
      user: {
        select: { email: true },
      },
      course: {
        select: { title: true },
      },
    },
  });

  console.log(`\n📋 발견된 PENDING Purchase: ${pendingPurchases.length}개`);

  if (pendingPurchases.length === 0) {
    console.log('✅ 정리할 Purchase가 없습니다.');
    return;
  }

  // 각 Purchase 정보 출력
  pendingPurchases.forEach((purchase, index) => {
    console.log(`\n${index + 1}. Purchase ID: ${purchase.id}`);
    console.log(`   사용자: ${purchase.user.email}`);
    console.log(`   강의: ${purchase.course.title}`);
    console.log(`   금액: ₩${purchase.amount.toLocaleString()}`);
    console.log(`   생성일: ${purchase.createdAt.toLocaleString('ko-KR')}`);
  });

  // 삭제 (Payment는 Cascade로 자동 삭제됨)
  const result = await prisma.purchase.deleteMany({
    where: {
      status: 'PENDING',
    },
  });

  console.log(`\n✅ ${result.count}개의 PENDING Purchase가 삭제되었습니다.`);
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
