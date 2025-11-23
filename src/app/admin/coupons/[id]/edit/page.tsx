'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  price: number;
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
  usageLimitPerUser?: number;
  isActive: boolean;
  applicableCourses: {
    course: {
      id: string;
      title: string;
      price: number;
    };
  }[];
}

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const [formData, setFormData] = useState({
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    validFrom: '',
    validUntil: '',
    usageLimit: 0,
    usageLimitPerUser: 1,
    isActive: true,
    applicableCourseIds: [] as string[],
    applyToAllCourses: true,
  });

  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, status, id]);

  const fetchData = async () => {
    try {
      const [couponRes, coursesRes] = await Promise.all([
        fetch(`/api/admin/coupons/${id}`),
        fetch('/api/courses'),
      ]);

      if (!couponRes.ok) {
        if (couponRes.status === 404) {
          alert('쿠폰을 찾을 수 없습니다.');
          router.push('/admin/coupons');
          return;
        }
        throw new Error('Failed to fetch coupon');
      }

      const coupon: Coupon = await couponRes.json();
      const coursesData = await coursesRes.json();

      setCourses(coursesData.courses || coursesData);
      setCouponCode(coupon.code);

      const applicableCourseIds = coupon.applicableCourses.map(ac => ac.course.id);

      setFormData({
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || 0,
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
        usageLimit: coupon.usageLimit || 0,
        usageLimitPerUser: coupon.usageLimitPerUser || 0,
        isActive: coupon.isActive,
        applicableCourseIds,
        applyToAllCourses: applicableCourseIds.length === 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      alert('퍼센트 할인은 100%를 초과할 수 없습니다.');
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minPurchaseAmount: formData.minPurchaseAmount || null,
        maxDiscountAmount: formData.maxDiscountAmount || null,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil || null,
        usageLimit: formData.usageLimit || null,
        usageLimitPerUser: formData.usageLimitPerUser || null,
        isActive: formData.isActive,
        applicableCourseIds: formData.applyToAllCourses ? [] : formData.applicableCourseIds,
      };

      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update coupon');
      }

      alert('쿠폰이 수정되었습니다.');
      router.push(`/admin/coupons/${id}`);
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      alert(error.message || '쿠폰 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableCourseIds: prev.applicableCourseIds.includes(courseId)
        ? prev.applicableCourseIds.filter((id) => id !== courseId)
        : [...prev.applicableCourseIds, courseId],
    }));
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href={`/admin/coupons/${id}`} className="text-primary hover:underline text-sm mb-2 inline-block">
            ← 쿠폰 상세로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">쿠폰 수정</h1>
          <p className="text-text-secondary mt-1">코드: {couponCode}</p>
        </div>

        {/* 쿠폰 수정 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">기본 정보</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  설명
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="예: 신규 회원 50% 할인"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-text-primary">쿠폰 활성화</span>
                </label>
              </div>
            </div>
          </div>

          {/* 할인 설정 */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">할인 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  할인 타입
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="PERCENTAGE">퍼센트 할인</option>
                  <option value="FIXED_AMOUNT">고정 금액 할인</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  할인 값 {formData.discountType === 'PERCENTAGE' ? '(%)' : '(원)'}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                  min="1"
                  max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  최소 구매 금액
                </label>
                <input
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {formData.discountType === 'PERCENTAGE' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    최대 할인 금액
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 유효기간 설정 */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">유효기간 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  min={formData.validFrom}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-text-secondary mt-1">
                  비워두면 무기한
                </p>
              </div>
            </div>
          </div>

          {/* 사용 제한 설정 */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">사용 제한 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  전체 사용 제한
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-text-secondary mt-1">
                  0이면 무제한
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  사용자당 사용 제한
                </label>
                <input
                  type="number"
                  value={formData.usageLimitPerUser}
                  onChange={(e) => setFormData({ ...formData, usageLimitPerUser: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-text-secondary mt-1">
                  0이면 무제한
                </p>
              </div>
            </div>
          </div>

          {/* 적용 강의 선택 */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">적용 강의</h2>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.applyToAllCourses}
                  onChange={(e) => setFormData({ ...formData, applyToAllCourses: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-text-primary">모든 강의에 적용</span>
              </label>
            </div>

            {!formData.applyToAllCourses && (
              <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-4">
                {courses.map((course) => (
                  <label key={course.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.applicableCourseIds.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="mr-2"
                    />
                    <span className="text-text-primary">{course.title}</span>
                    <span className="text-text-secondary ml-2">(₩{course.price.toLocaleString()})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/admin/coupons/${id}`}
              className="px-6 py-2 text-text-secondary hover:text-text-primary"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
