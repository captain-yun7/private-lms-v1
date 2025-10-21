'use client';

import { useState, useEffect } from 'react';

interface TaxInvoice {
  id: string;
  businessNumber: string;
  companyName: string;
  ceoName: string;
  email: string;
  phone: string;
  amount: number;
  status: 'REQUESTED' | 'ISSUED' | 'CANCELED';
  createdAt: string;
  issuedAt: string | null;
  purchase: {
    user: {
      name: string | null;
      email: string | null;
    };
    course: {
      title: string;
    };
  };
}

export default function AdminTaxInvoicesPage() {
  const [taxInvoices, setTaxInvoices] = useState<TaxInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [issueLoading, setIssueLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTaxInvoices(statusFilter);
  }, [statusFilter]);

  const fetchTaxInvoices = async (status: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tax-invoices?status=${status}`);
      const data = await response.json();

      if (response.ok) {
        setTaxInvoices(data.taxInvoices);
      } else {
        alert(data.error || '세금계산서 목록을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('세금계산서 목록 로딩 실패:', error);
      alert('세금계산서 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (id: string) => {
    if (!confirm('세금계산서를 발행 처리하시겠습니까?\n홈택스 또는 회계 프로그램에서 실제 발급을 완료해주세요.')) {
      return;
    }

    try {
      setIssueLoading(id);
      const response = await fetch(`/api/admin/tax-invoices/${id}/issue`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('세금계산서 발행 처리가 완료되었습니다');
        fetchTaxInvoices(statusFilter);
      } else {
        alert(data.error || '세금계산서 발행에 실패했습니다');
      }
    } catch (error) {
      console.error('세금계산서 발행 실패:', error);
      alert('세금계산서 발행에 실패했습니다');
    } finally {
      setIssueLoading(null);
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

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            발급대기
          </span>
        );
      case 'ISSUED':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            발급완료
          </span>
        );
      case 'CANCELED':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            취소
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">세금계산서 관리</h1>
          <p className="mt-2 text-gray-600">세금계산서 발급 요청을 관리합니다</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setStatusFilter('REQUESTED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'REQUESTED'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            발급대기
          </button>
          <button
            onClick={() => setStatusFilter('ISSUED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'ISSUED'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            발급완료
          </button>
        </div>

        {/* Tax Invoice List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : taxInvoices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              세금계산서 요청이 없습니다
            </h3>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    구매자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    강의명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사업자정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.purchase.user.name || '익명'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.purchase.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {invoice.purchase.course.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {invoice.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.businessNumber}
                      </div>
                      <div className="text-sm text-gray-500">{invoice.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {invoice.status === 'REQUESTED' ? (
                        <button
                          onClick={() => handleIssue(invoice.id)}
                          disabled={issueLoading === invoice.id}
                          className="text-primary hover:text-primary-dark disabled:opacity-50"
                        >
                          {issueLoading === invoice.id ? '처리 중...' : '발행 처리'}
                        </button>
                      ) : invoice.status === 'ISSUED' ? (
                        <span className="text-green-600">
                          {formatDate(invoice.issuedAt!)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">안내사항</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              발행 처리 버튼을 클릭하면 시스템에서 '발행완료' 상태로 변경됩니다
            </li>
            <li>
              실제 세금계산서는 홈택스 또는 회계 프로그램에서 별도로 발급해주세요
            </li>
            <li>
              발급 후 사업자 이메일로 세금계산서를 전송해주시기 바랍니다
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
