import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CouponService } from '@/lib/services/coupon.service';
import { z } from 'zod';
import { DiscountType } from '@prisma/client';

// 쿠폰 생성 스키마
const createCouponSchema = z.object({
  code: z.string().optional(), // 비어있으면 자동 생성
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(1),
  minPurchaseAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  usageLimit: z.number().optional(),
  usageLimitPerUser: z.number().optional(),
  applicableCourseIds: z.array(z.string()).optional(),
});

// GET: 쿠폰 목록 조회
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // 검색 조건 생성
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // 전체 개수 조회
    const totalCount = await prisma.coupon.count({ where });

    // 쿠폰 목록 조회
    const coupons = await prisma.coupon.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        applicableCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            couponUsages: true,
          },
        },
      },
    });

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    console.error('Coupon list error:', error);
    return NextResponse.json(
      { error: '쿠폰 목록 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 쿠폰 생성
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createCouponSchema.parse(body);

    // 쿠폰 코드 생성 (없으면 자동 생성)
    const couponCode = data.code || await CouponService.generateUniqueCode();

    // 이미 존재하는 코드인지 확인
    if (data.code) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: data.code },
      });

      if (existingCoupon) {
        return NextResponse.json(
          { error: '이미 존재하는 쿠폰 코드입니다.' },
          { status: 400 }
        );
      }
    }

    // 쿠폰 생성
    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        description: data.description,
        discountType: data.discountType as DiscountType,
        discountValue: data.discountValue,
        minPurchaseAmount: data.minPurchaseAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,
        isActive: true,
        applicableCourses: data.applicableCourseIds ? {
          create: data.applicableCourseIds.map(courseId => ({
            courseId,
          })),
        } : undefined,
      },
      include: {
        applicableCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error('Coupon creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '쿠폰 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}