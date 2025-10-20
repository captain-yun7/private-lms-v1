import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 최근 무통장입금 확인
  const payments = await prisma.payment.findMany({
    where: {
      method: 'BANK_TRANSFER',
    },
    include: {
      bankTransfer: true,
      purchase: {
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  console.log('=== 최근 무통장입금 5건 ===\n');

  payments.forEach((payment, index) => {
    console.log(`${index + 1}. ${payment.purchase.course.title}`);
    console.log(`   주문번호: ${payment.orderId}`);
    console.log(`   Payment 상태: ${payment.status}`);
    console.log(`   BankTransfer:`, payment.bankTransfer);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
