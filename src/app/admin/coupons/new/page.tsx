'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  price: number;
}

export default function NewCouponPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: 0,
    usageLimitPerUser: 1,
    applicableCourseIds: [] as string[],
    applyToAllCourses: true,
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchCourses();
  }, [session, status]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data.courses || data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      alert('퍼센트 할인은 100%를 초과할 수 없습니다.');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        code: formData.code || undefined,
        minPurchaseAmount: formData.minPurchaseAmount || undefined,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        validUntil: formData.validUntil || undefined,
        usageLimit: formData.usageLimit || undefined,
        usageLimitPerUser: formData.usageLimitPerUser || undefined,
        applicableCourseIds: formData.applyToAllCourses ? undefined : formData.applicableCourseIds,
      };

      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create coupon');
      }

      const result = await response.json();
      alert(`쿠폰이 생성되었습니다. 코드: ${result.coupon.code}`);
      router.push('/admin/coupons');
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      alert(error.message || '쿠폰 생성에 실패했습니다.');
    } finally {
      setLoading(false);
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

  if (status === 'loading') {
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
          <Link href="/admin/coupons" className="text-primary hover:underline text-sm mb-2 inline-block">
            ← 쿠폰 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">새 쿠폰 생성</h1>
        </div>

        {/* 쿠폰 생성 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">기본 정보</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  쿠폰 코드 (선택사항)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="자동 생성됨"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-text-secondary mt-1">
                  비워두면 자동으로 생성됩니다
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  설명 (선택사항)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="예: 신규 회원 50% 할인"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                />
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
                  최소 구매 금액 (선택사항)
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
                    최대 할인 금액 (선택사항)
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
                  종료일 (선택사항)
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
                  전체 사용 제한 (선택사항)
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
                  사용자당 사용 제한 (선택사항)
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
              href="/admin/coupons"
              className="px-6 py-2 text-text-secondary hover:text-text-primary"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? '생성 중...' : '쿠폰 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}