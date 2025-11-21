import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { DiscountType } from '@prisma/client';

// 쿠폰 수정 스키마
const updateCouponSchema = z.object({
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
  discountValue: z.number().min(1).optional(),
  minPurchaseAmount: z.number().nullable().optional(),
  maxDiscountAmount: z.number().nullable().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().nullable().optional(),
  usageLimit: z.number().nullable().optional(),
  usageLimitPerUser: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
  applicableCourseIds: z.array(z.string()).optional(),
});

// GET: 쿠폰 상세 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        applicableCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
        couponUsages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            purchase: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: {
            usedAt: 'desc',
          },
        },
        _count: {
          select: {
            couponUsages: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: '쿠폰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Coupon detail error:', error);
    return NextResponse.json(
      { error: '쿠폰 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 쿠폰 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateCouponSchema.parse(body);

    // 기존 쿠폰 확인
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: '쿠폰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 트랜잭션으로 처리
    const updatedCoupon = await prisma.$transaction(async (tx) => {
      // 적용 가능한 강의 업데이트
      if (data.applicableCourseIds !== undefined) {
        // 기존 관계 삭제
        await tx.couponCourse.deleteMany({
          where: { couponId: params.id },
        });

        // 새로운 관계 생성
        if (data.applicableCourseIds.length > 0) {
          await tx.couponCourse.createMany({
            data: data.applicableCourseIds.map(courseId => ({
              couponId: params.id,
              courseId,
            })),
          });
        }
      }

      // 쿠폰 업데이트
      const updateData: any = {
        description: data.description,
        discountType: data.discountType as DiscountType,
        discountValue: data.discountValue,
        minPurchaseAmount: data.minPurchaseAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        isActive: data.isActive,
      };

      if (data.validFrom !== undefined) {
        updateData.validFrom = new Date(data.validFrom);
      }

      if (data.validUntil !== undefined) {
        updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
      }

      if (data.usageLimit !== undefined) {
        updateData.usageLimit = data.usageLimit;
      }

      if (data.usageLimitPerUser !== undefined) {
        updateData.usageLimitPerUser = data.usageLimitPerUser;
      }

      return await tx.coupon.update({
        where: { id: params.id },
        data: updateData,
        include: {
          applicableCourses: {
            include: {
              course: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error('Coupon update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '쿠폰 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 쿠폰 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용 이력이 있는지 확인
    const couponWithUsage = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            couponUsages: true,
          },
        },
      },
    });

    if (!couponWithUsage) {
      return NextResponse.json(
        { error: '쿠폰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (couponWithUsage._count.couponUsages > 0) {
      // 사용 이력이 있으면 비활성화만
      await prisma.coupon.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: '사용 이력이 있어 비활성화 처리되었습니다.',
      });
    } else {
      // 사용 이력이 없으면 삭제
      await prisma.coupon.delete({
        where: { id: params.id },
      });

      return NextResponse.json({
        success: true,
        message: '쿠폰이 삭제되었습니다.',
      });
    }
  } catch (error) {
    console.error('Coupon delete error:', error);
    return NextResponse.json(
      { error: '쿠폰 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}