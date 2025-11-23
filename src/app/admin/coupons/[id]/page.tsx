'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CouponUsage {
  id: string;
  usedAt: string;
  discountAmount: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  purchase: {
    id: string;
    course: {
      id: string;
      title: string;
    };
  };
}

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil?: string;
  usageLimit?: number;
  usageCount: number;
  usageLimitPerUser?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    couponUsages: number;
  };
  applicableCourses: {
    course: {
      id: string;
      title: string;
      price: number;
    };
  }[];
  couponUsages: CouponUsage[];
}

export default function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchCoupon();
  }, [session, status, id]);

  const fetchCoupon = async () => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          alert('쿠폰을 찾을 수 없습니다.');
          router.push('/admin/coupons');
          return;
        }
        throw new Error('Failed to fetch coupon');
      }

      const data = await response.json();
      setCoupon(data);
    } catch (error) {
      console.error('Error fetching coupon:', error);
      alert('쿠폰을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDiscountDisplay = (type: string, value: number) => {
    return type === 'PERCENTAGE' ? `${value}%` : `₩${value.toLocaleString()}`;
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!coupon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-light py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/admin/coupons" className="text-primary hover:underline text-sm mb-2 inline-block">
            ← 쿠폰 목록으로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-text-primary">{coupon.code}</h1>
            <div className="flex gap-2">
              <Link
                href={`/admin/coupons/${id}/edit`}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                수정
              </Link>
              <span
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  coupon.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {coupon.isActive ? '활성' : '비활성'}
              </span>
            </div>
          </div>
          {coupon.description && (
            <p className="text-text-secondary mt-2">{coupon.description}</p>
          )}
        </div>

        {/* 쿠폰 정보 */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">쿠폰 정보</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-text-secondary">할인</span>
              <p className="font-semibold text-green-600 text-lg">
                {formatDiscountDisplay(coupon.discountType, coupon.discountValue)}
              </p>
            </div>

            <div>
              <span className="text-sm text-text-secondary">사용 현황</span>
              <p className="font-medium">
                {coupon._count.couponUsages} / {coupon.usageLimit || '무제한'}
              </p>
            </div>

            <div>
              <span className="text-sm text-text-secondary">유효기간</span>
              <p className="font-medium">
                {formatDate(coupon.validFrom).split(' ')[0]} ~ {coupon.validUntil ? formatDate(coupon.validUntil).split(' ')[0] : '무기한'}
              </p>
            </div>

            <div>
              <span className="text-sm text-text-secondary">사용자당 제한</span>
              <p className="font-medium">
                {coupon.usageLimitPerUser || '무제한'}회
              </p>
            </div>

            {coupon.minPurchaseAmount && (
              <div>
                <span className="text-sm text-text-secondary">최소 구매 금액</span>
                <p className="font-medium">₩{coupon.minPurchaseAmount.toLocaleString()}</p>
              </div>
            )}

            {coupon.maxDiscountAmount && coupon.discountType === 'PERCENTAGE' && (
              <div>
                <span className="text-sm text-text-secondary">최대 할인 금액</span>
                <p className="font-medium">₩{coupon.maxDiscountAmount.toLocaleString()}</p>
              </div>
            )}

            <div>
              <span className="text-sm text-text-secondary">생성일</span>
              <p className="font-medium">{formatDate(coupon.createdAt)}</p>
            </div>

            <div>
              <span className="text-sm text-text-secondary">수정일</span>
              <p className="font-medium">{formatDate(coupon.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* 적용 강의 */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">적용 강의</h2>

          {coupon.applicableCourses.length > 0 ? (
            <div className="space-y-2">
              {coupon.applicableCourses.map((item) => (
                <div key={item.course.id} className="flex justify-between items-center p-3 bg-bg-light rounded-lg">
                  <span className="text-text-primary">{item.course.title}</span>
                  <span className="text-text-secondary">₩{item.course.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">모든 강의에 적용</p>
          )}
        </div>

        {/* 사용 이력 */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            사용 이력 ({coupon.couponUsages.length})
          </h2>

          {coupon.couponUsages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-light">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      사용자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      강의
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      할인 금액
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      사용일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {coupon.couponUsages.map((usage) => (
                    <tr key={usage.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-text-primary">{usage.user.name}</p>
                          <p className="text-xs text-text-secondary">{usage.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {usage.purchase.course.title}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        -₩{usage.discountAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {formatDate(usage.usedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary">아직 사용 이력이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
