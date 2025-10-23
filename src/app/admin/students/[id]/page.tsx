'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentDetail {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  enrollments: Array<{
    id: string;
    enrolledAt: string;
    course: {
      id: string;
      title: string;
      thumbnailUrl: string | null;
      _count?: {
        videos: number;
      };
    };
    progress: Array<{
      videoId: string;
      isCompleted: boolean;
    }>;
  }>;
  purchases: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    course: {
      id: string;
      title: string;
    };
    payment: {
      method: string;
      status: string;
      paidAt: string | null;
    };
  }>;
  devices: Array<{
    id: string;
    name: string;
    platform: string | null;
    lastUsedAt: string;
    createdAt: string;
  }>;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/students/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setStudent(data.student);
      } else {
        alert(data.error || '학생 정보를 불러오는데 실패했습니다');
        router.push('/admin/students');
      }
    } catch (error) {
      console.error('학생 정보 로딩 실패:', error);
      alert('학생 정보를 불러오는데 실패했습니다');
      router.push('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm('정말 이 기기를 해제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('기기가 해제되었습니다');
        fetchStudent(); // 새로고침
      } else {
        const data = await response.json();
        alert(data.error || '기기 해제에 실패했습니다');
      }
    } catch (error) {
      console.error('기기 해제 실패:', error);
      alert('기기 해제에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  // 진도율 계산
  const calculateProgress = (enrollment: StudentDetail['enrollments'][0]) => {
    const totalVideos = enrollment.course._count?.videos || 0;
    const completedVideos = enrollment.progress.filter(p => p.isCompleted).length;
    return totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  };

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/students"
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← 학생 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">학생 상세 정보</h1>
        </div>

        {/* Student Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            {student.image ? (
              <img
                className="h-20 w-20 rounded-full"
                src={student.image}
                alt=""
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl text-gray-500 font-medium">
                  {student.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {student.name || '익명'}
              </h2>
              <p className="text-gray-600">{student.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                가입일: {formatDate(student.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500">수강 중인 강의</div>
            <div className="text-2xl font-bold text-gray-900">
              {student.enrollments.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500">총 구매 건수</div>
            <div className="text-2xl font-bold text-gray-900">
              {student.purchases.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-500">등록 기기</div>
            <div className="text-2xl font-bold text-gray-900">
              {student.devices.length}
            </div>
          </div>
        </div>

        {/* Enrollments */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            수강 중인 강의 ({student.enrollments.length})
          </h3>
          {student.enrollments.length === 0 ? (
            <p className="text-gray-500">수강 중인 강의가 없습니다</p>
          ) : (
            <div className="space-y-4">
              {student.enrollments.map((enrollment) => {
                const progress = calculateProgress(enrollment);
                return (
                  <div key={enrollment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link
                          href={`/admin/courses/${enrollment.course.id}`}
                          className="font-medium text-gray-900 hover:text-primary"
                        >
                          {enrollment.course.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          수강 시작: {formatDate(enrollment.enrolledAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchases */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            결제 내역 ({student.purchases.length})
          </h3>
          {student.purchases.length === 0 ? (
            <p className="text-gray-500">결제 내역이 없습니다</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      강의명
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      금액
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      결제 방법
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      상태
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      결제일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {student.purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {purchase.course.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatAmount(purchase.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {purchase.payment.method === 'CARD' ? '카드' : '무통장입금'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            purchase.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : purchase.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {purchase.status === 'COMPLETED'
                            ? '완료'
                            : purchase.status === 'PENDING'
                            ? '대기'
                            : '취소'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {purchase.payment.paidAt
                          ? formatDate(purchase.payment.paidAt)
                          : formatDate(purchase.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            등록 기기 ({student.devices.length}/2)
          </h3>
          {student.devices.length === 0 ? (
            <p className="text-gray-500">등록된 기기가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {student.devices.map((device) => (
                <div key={device.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{device.name}</p>
                      <p className="text-sm text-gray-500">
                        플랫폼: {device.platform || '-'}
                      </p>
                      <p className="text-sm text-gray-500">
                        마지막 사용: {formatDateTime(device.lastUsedAt)}
                      </p>
                      <p className="text-sm text-gray-500">
                        등록일: {formatDate(device.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveDevice(device.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      해제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
