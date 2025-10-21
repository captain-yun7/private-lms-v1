'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    newUsers: number;
    newEnrollments: number;
    periodRevenue: number;
    completedPayments: number;
    pendingPayments: number;
  };
  courseStats: Array<{
    id: string;
    title: string;
    thumbnailUrl: string | null;
    price: number;
    revenue: number;
    _count: {
      enrollments: number;
      purchases: number;
    };
  }>;
  recentEnrollments: Array<{
    id: string;
    enrolledAt: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
    course: {
      id: string;
      title: string;
    };
  }>;
  recentPayments: Array<{
    id: string;
    orderId: string;
    method: string;
    paidAt: string | null;
    purchase: {
      amount: number;
      user: {
        id: string;
        name: string | null;
        email: string | null;
      };
      course: {
        id: string;
        title: string;
      };
    };
  }>;
  charts: {
    userGrowth: Array<{ date: string; count: number }>;
    revenueByDay: Array<{ date: string; amount: number }>;
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard?period=${period}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        alert(result.error || '대시보드 데이터를 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
      alert('대시보드 데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { overview, courseStats, recentEnrollments, recentPayments, charts } = data;

  // 최대값 계산 (차트용)
  const maxUserGrowth = Math.max(...charts.userGrowth.map(d => d.count), 1);
  const maxRevenue = Math.max(...charts.revenueByDay.map(d => d.amount), 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">플랫폼 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="7">최근 7일</option>
          <option value="30">최근 30일</option>
          <option value="90">최근 90일</option>
          <option value="365">최근 1년</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">전체 회원</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                +{overview.newUsers} (최근 {period}일)
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">전체 강의</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.totalCourses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">게시된 강의</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">전체 수강 신청</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.totalEnrollments.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                +{overview.newEnrollments} (최근 {period}일)
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">전체 수익</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(overview.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                +{formatAmount(overview.periodRevenue)} (최근 {period}일)
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 현황</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">완료된 결제</span>
              <span className="text-lg font-semibold text-green-600">
                {overview.completedPayments.toLocaleString()}건
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">대기 중 (무통장입금)</span>
              <span className="text-lg font-semibold text-yellow-600">
                {overview.pendingPayments.toLocaleString()}건
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 링크</h3>
          <div className="space-y-2">
            <Link
              href="/admin/students"
              className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700"
            >
              회원 관리
            </Link>
            <Link
              href="/admin/payments"
              className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700"
            >
              결제 관리
            </Link>
            <Link
              href="/admin/courses"
              className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700"
            >
              강의 관리
            </Link>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">회원 가입 추이 (최근 7일)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {charts.userGrowth.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(data.count / maxUserGrowth) * 100}%`, minHeight: data.count > 0 ? '4px' : '0' }}>
                  <div className="text-xs text-center text-white font-semibold pt-1">
                    {data.count > 0 ? data.count : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{formatShortDate(data.date)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">일별 수익 추이 (최근 7일)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {charts.revenueByDay.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-green-500 rounded-t" style={{ height: `${(data.amount / maxRevenue) * 100}%`, minHeight: data.amount > 0 ? '4px' : '0' }}>
                  <div className="text-xs text-center text-white font-semibold pt-1">
                    {data.amount > 0 ? Math.round(data.amount / 10000) + '만' : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{formatShortDate(data.date)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 강의 Top 5</h3>
        <div className="space-y-4">
          {courseStats.map((course, index) => (
            <div key={course.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
              {course.thumbnailUrl && (
                <div className="relative w-20 h-12 flex-shrink-0">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1">
                <Link href={`/admin/courses/${course.id}`} className="font-medium text-gray-900 hover:text-primary">
                  {course.title}
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  수강생: {course._count.enrollments}명 | 구매: {course._count.purchases}건
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatAmount(course.revenue)}
                </div>
                <div className="text-sm text-gray-500">수익</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 수강 신청</h3>
          <div className="space-y-3">
            {recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Link
                    href={`/admin/students/${enrollment.user.id}`}
                    className="font-medium text-gray-900 hover:text-primary text-sm"
                  >
                    {enrollment.user.name || '익명'}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                    {enrollment.course.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(enrollment.enrolledAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 결제</h3>
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Link
                    href={`/admin/students/${payment.purchase.user.id}`}
                    className="font-medium text-gray-900 hover:text-primary text-sm"
                  >
                    {payment.purchase.user.name || '익명'}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                    {payment.purchase.course.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {payment.paidAt ? formatDate(payment.paidAt) : ''}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatAmount(payment.purchase.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
