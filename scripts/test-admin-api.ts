import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== 무통장입금 목록 조회 테스트 ===\n');

    const transfers = await prisma.bankTransfer.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        payment: {
          include: {
            purchase: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`총 ${transfers.length}건 발견\n`);

    transfers.forEach((transfer, index) => {
      console.log(`${index + 1}. ${transfer.payment.purchase.course.title}`);
      console.log(`   입금자명: ${transfer.depositorName}`);
      console.log(`   상태: ${transfer.status}`);
      console.log(`   구매자: ${transfer.payment.purchase.user.name}`);
      console.log(`   금액: ₩${transfer.payment.purchase.amount.toLocaleString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
