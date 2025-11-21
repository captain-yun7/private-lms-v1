'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  _count: {
    couponUsages: number;
  };
  applicableCourses: {
    course: {
      id: string;
      title: string;
    };
  }[];
}

export default function AdminCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterActive, setFilterActive] = useState<'all' | 'true' | 'false'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchCoupons();
  }, [session, status, currentPage, filterActive]);

  const fetchCoupons = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (search) {
        params.append('search', search);
      }

      if (filterActive !== 'all') {
        params.append('isActive', filterActive);
      }

      const response = await fetch(`/api/admin/coupons?${params}`);
      if (!response.ok) throw new Error('Failed to fetch coupons');

      const data = await response.json();
      setCoupons(data.coupons);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('쿠폰 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    if (!confirm(`쿠폰을 ${currentStatus ? '비활성화' : '활성화'}하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update coupon');

      alert(`쿠폰이 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`);
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('쿠폰 상태 변경에 실패했습니다.');
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete coupon');

      const data = await response.json();
      alert(data.message);
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('쿠폰 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  return (
    <div className="min-h-screen bg-bg-light">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-text-primary">쿠폰 관리</h1>
            <Link
              href="/admin/coupons/new"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              새 쿠폰 생성
            </Link>
          </div>

          {/* 필터 및 검색 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-secondary hover:bg-gray-50'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterActive('true')}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === 'true'
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-secondary hover:bg-gray-50'
                }`}
              >
                활성
              </button>
              <button
                onClick={() => setFilterActive('false')}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === 'false'
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-secondary hover:bg-gray-50'
                }`}
              >
                비활성
              </button>
            </div>

            <div className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="쿠폰 코드 또는 설명 검색..."
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    fetchCoupons();
                  }
                }}
              />
              <button
                onClick={() => {
                  setCurrentPage(1);
                  fetchCoupons();
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 쿠폰 목록 */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-light border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    쿠폰 코드
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    할인
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    사용/제한
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    유효기간
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    적용 강의
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-bg-light/50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {coupon.code}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {coupon.description || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        {formatDiscountDisplay(coupon.discountType, coupon.discountValue)}
                      </span>
                      {coupon.minPurchaseAmount && (
                        <div className="text-xs text-text-secondary">
                          최소 ₩{coupon.minPurchaseAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {coupon._count.couponUsages} / {coupon.usageLimit || '무제한'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{formatDate(coupon.validFrom)}</div>
                      <div className="text-text-secondary">
                        ~ {coupon.validUntil ? formatDate(coupon.validUntil) : '무기한'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {coupon.applicableCourses.length > 0 ? (
                        <div className="max-w-xs">
                          {coupon.applicableCourses.slice(0, 2).map((item) => (
                            <div key={item.course.id} className="truncate text-xs text-text-secondary">
                              {item.course.title}
                            </div>
                          ))}
                          {coupon.applicableCourses.length > 2 && (
                            <div className="text-xs text-primary">
                              +{coupon.applicableCourses.length - 2}개 더
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-text-secondary">전체 강의</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {coupon.isActive ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/coupons/${coupon.id}/edit`}
                          className="text-primary hover:underline text-sm"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                이전
              </button>
              <span className="text-sm text-text-secondary">
                {currentPage} / {totalPages} 페이지
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}