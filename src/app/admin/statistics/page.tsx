'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RevenueData {
  summary: {
    total: { revenue: number; count: number };
    period: { revenue: number; count: number };
  };
  byMethod: Array<{ method: string; revenue: number; count: number }>;
  byStatus: Array<{ status: string; revenue: number; count: number }>;
  byCourse: Array<{
    course: { id: string; title: string; thumbnailUrl: string | null };
    revenue: number;
    count: number;
  }>;
  timeSeries: Array<{ date: string; amount: number; count: number }>;
}

interface EnrollmentData {
  summary: {
    total: {
      enrollments: number;
      completedEnrollments: number;
      completionRate: number;
    };
    period: {
      enrollments: number;
      activeLearners: number;
    };
  };
  byCourse: Array<{
    course: {
      id: string;
      title: string;
      thumbnailUrl: string | null;
      videoCount: number;
    };
    enrollmentCount: number;
    completedStudents: number;
    completionRate: number;
  }>;
  timeSeries: Array<{ date: string; count: number }>;
}

export default function AdminStatisticsPage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'enrollment'>('revenue');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    fetchStatistics();
  }, [period, groupBy, activeTab]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      if (activeTab === 'revenue') {
        const response = await fetch(`/api/admin/statistics/revenue?period=${period}&groupBy=${groupBy}`);
        const data = await response.json();
        if (response.ok) {
          setRevenueData(data);
        } else {
          alert(data.error || '수익 통계를 불러오는데 실패했습니다');
        }
      } else {
        const response = await fetch(`/api/admin/statistics/enrollments?period=${period}&groupBy=${groupBy}`);
        const data = await response.json();
        if (response.ok) {
          setEnrollmentData(data);
        } else {
          alert(data.error || '수강 통계를 불러오는데 실패했습니다');
        }
      }
    } catch (error) {
      console.error('통계 데이터 로딩 실패:', error);
      alert('통계 데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const formatDate = (dateString: string) => {
    if (groupBy === 'month') {
      const [year, month] = dateString.split('-');
      return `${year}/${month}`;
    }
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'CARD': return '카드';
      case 'BANK_TRANSFER': return '무통장입금';
      default: return method;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">통계</h1>
        <p className="text-gray-600 mt-2">수익 및 수강 통계를 확인하세요</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'revenue'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            수익 통계
          </button>
          <button
            onClick={() => setActiveTab('enrollment')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'enrollment'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            수강 통계
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">그룹</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="day">일별</option>
            <option value="week">주별</option>
            <option value="month">월별</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : activeTab === 'revenue' && revenueData ? (
        <div>
          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">전체 수익</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatAmount(revenueData.summary.total.revenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {revenueData.summary.total.count.toLocaleString()}건
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">기간 내 수익</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatAmount(revenueData.summary.period.revenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {revenueData.summary.period.count.toLocaleString()}건
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">평균 결제 금액</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {revenueData.summary.period.count > 0
                  ? formatAmount(Math.round(revenueData.summary.period.revenue / revenueData.summary.period.count))
                  : '0원'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">결제 수단</p>
              <div className="mt-2 space-y-1">
                {revenueData.byMethod.map((method) => (
                  <div key={method.method} className="flex justify-between text-sm">
                    <span className="text-gray-600">{getMethodLabel(method.method)}</span>
                    <span className="font-semibold">{method.count}건</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">수익 추이</h3>
            <div className="h-80 flex items-end justify-between gap-1">
              {revenueData.timeSeries.map((data, index) => {
                const maxAmount = Math.max(...revenueData.timeSeries.map(d => d.amount), 1);
                const height = (data.amount / maxAmount) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                      style={{ height: `${height}%`, minHeight: data.amount > 0 ? '2px' : '0' }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {formatAmount(data.amount)}
                        <br />
                        {data.count}건
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                      {formatDate(data.date)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Courses by Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">강의별 수익 Top 10</h3>
            <div className="space-y-4">
              {revenueData.byCourse.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-400 w-6">{index + 1}</div>
                  {item.course.thumbnailUrl && (
                    <div className="relative w-16 h-10 flex-shrink-0">
                      <Image
                        src={item.course.thumbnailUrl}
                        alt={item.course.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/admin/courses/${item.course.id}`}
                      className="font-medium text-gray-900 hover:text-primary"
                    >
                      {item.course.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">{item.count}건 판매</div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatAmount(item.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'enrollment' && enrollmentData ? (
        <div>
          {/* Enrollment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">전체 수강생</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {enrollmentData.summary.total.enrollments.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">누적</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">기간 내 신규 수강</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {enrollmentData.summary.period.enrollments.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">완강률</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {enrollmentData.summary.total.completionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {enrollmentData.summary.total.completedEnrollments.toLocaleString()}명 완강
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500">활성 학습자</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {enrollmentData.summary.period.activeLearners.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">최근 {period}일</p>
            </div>
          </div>

          {/* Enrollment Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">수강 신청 추이</h3>
            <div className="h-80 flex items-end justify-between gap-1">
              {enrollmentData.timeSeries.map((data, index) => {
                const maxCount = Math.max(...enrollmentData.timeSeries.map(d => d.count), 1);
                const height = (data.count / maxCount) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                      style={{ height: `${height}%`, minHeight: data.count > 0 ? '2px' : '0' }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {data.count}명
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                      {formatDate(data.date)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Courses by Enrollment */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">강의별 수강생 Top 10</h3>
            <div className="space-y-4">
              {enrollmentData.byCourse.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-400 w-6">{index + 1}</div>
                  {item.course.thumbnailUrl && (
                    <div className="relative w-16 h-10 flex-shrink-0">
                      <Image
                        src={item.course.thumbnailUrl}
                        alt={item.course.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/admin/courses/${item.course.id}`}
                      className="font-medium text-gray-900 hover:text-primary"
                    >
                      {item.course.title}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                      총 {item.course.videoCount}개 강의
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {item.enrollmentCount.toLocaleString()}명
                    </div>
                    <div className="text-sm text-gray-500">
                      완강률: {item.completionRate}% ({item.completedStudents}명)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
