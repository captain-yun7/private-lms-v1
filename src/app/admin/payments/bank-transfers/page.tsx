'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BankTransferItem {
  id: string;
  depositorName: string;
  expectedDepositDate: string;
  status: string;
  createdAt: string;
  payment: {
    id: string;
    orderId: string;
    purchase: {
      id: string;
      amount: number;
      user: {
        name: string;
        email: string;
      };
      course: {
        title: string;
      };
    };
  };
}

export default function AdminBankTransfersPage() {
  const [transfers, setTransfers] = useState<BankTransferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchTransfers();
  }, [filter]);

  const fetchTransfers = async () => {
    try {
      const response = await fetch(`/api/admin/payments/bank-transfers?status=${filter}`);
      if (!response.ok) throw new Error('조회 실패');

      const data = await response.json();
      setTransfers(data.transfers);
    } catch (error) {
      console.error('Error:', error);
      alert('무통장입금 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transferId: string) => {
    if (!confirm('입금을 확인하고 승인하시겠습니까?\n승인 시 수강 등록 및 영수증이 발급됩니다.')) {
      return;
    }

    setProcessing(transferId);

    try {
      const response = await fetch(`/api/admin/payments/bank-transfers/${transferId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '승인 실패');
      }

      alert('승인되었습니다. 사용자에게 이메일 알림이 발송되었습니다.');
      fetchTransfers();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '승인 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transferId: string) => {
    const reason = prompt('거절 사유를 입력하세요:');
    if (!reason) return;

    setProcessing(transferId);

    try {
      const response = await fetch(`/api/admin/payments/bank-transfers/${transferId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '거절 실패');
      }

      alert('거절되었습니다.');
      fetchTransfers();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '거절 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };

    const labels = {
      PENDING: '입금 대기',
      APPROVED: '승인 완료',
      REJECTED: '거절',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">무통장입금 승인 관리</h1>
        <p className="mt-2 text-gray-600">입금 확인 후 승인 또는 거절 처리를 진행하세요</p>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'PENDING'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            입금 대기 중
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'APPROVED'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            승인 완료
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'REJECTED'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            거절
          </button>
        </div>
      </div>

      {/* 목록 */}
      {transfers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-600">무통장입금 신청 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신청일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  강의명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구매자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  입금자명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  입금 예정일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transfer.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">
                      {transfer.payment.purchase.course.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{transfer.payment.purchase.user.name}</div>
                    <div className="text-xs text-gray-500">{transfer.payment.purchase.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transfer.depositorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transfer.expectedDepositDate).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₩{transfer.payment.purchase.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transfer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transfer.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(transfer.id)}
                          disabled={processing === transfer.id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {processing === transfer.id ? '처리 중...' : '승인'}
                        </button>
                        <button
                          onClick={() => handleReject(transfer.id)}
                          disabled={processing === transfer.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          거절
                        </button>
                      </div>
                    )}
                    {transfer.status === 'APPROVED' && (
                      <Link
                        href={`/admin/payments/${transfer.payment.purchase.id}`}
                        className="text-primary hover:underline"
                      >
                        상세 보기
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
