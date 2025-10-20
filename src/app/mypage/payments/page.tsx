'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface PaymentItem {
  id: string;
  orderId: string;
  method: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  purchase: {
    id: string;
    amount: number;
    status: string;
    course: {
      id: string;
      title: string;
      thumbnailUrl: string | null;
    };
  };
  bankTransfer?: {
    id: string;
    status: string;
    depositorName: string;
    expectedDepositDate: string;
    approvedAt: string | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
  };
}

// 무통장입금 계좌 정보 컴포넌트
function BankTransferPendingInfo({ depositorName, expectedDepositDate }: { depositorName: string; expectedDepositDate: string }) {
  const [copied, setCopied] = useState(false);

  const bankInfo = {
    bank: '신한은행',
    accountNumber: '110-123-456789',
    accountHolder: '(주)Private LMS',
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-2 mb-3">
        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">입금 확인 중입니다</p>
          <p className="text-xs text-yellow-700 mt-1">
            입금자명: <strong>{depositorName}</strong>
          </p>
          <p className="text-xs text-yellow-700">
            입금 예정일: {new Date(expectedDepositDate).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 계좌 정보 */}
      <div className="bg-white rounded-lg p-3 space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">은행</span>
          <span className="text-sm font-semibold text-gray-900">{bankInfo.bank}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">계좌번호</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{bankInfo.accountNumber}</span>
            <button
              onClick={handleCopyAccount}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="복사"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">예금주</span>
          <span className="text-sm font-semibold text-gray-900">{bankInfo.accountHolder}</span>
        </div>
      </div>

      <p className="text-xs text-yellow-600">
        입금 확인 후 1-2 영업일 내에 승인됩니다.
      </p>
    </div>
  );
}

export default function MyPaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/mypage/payments');
      if (!response.ok) throw new Error('조회 실패');

      const data = await response.json();
      setPayments(data.payments);
    } catch (error) {
      console.error('Error:', error);
      alert('결제 내역을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CARD: '카드 결제',
      BANK_TRANSFER: '무통장입금',
    };
    return labels[method] || method;
  };

  const getPaymentStatusBadge = (payment: PaymentItem) => {
    // 무통장입금인 경우 BankTransfer 상태를 사용
    if (payment.method === 'BANK_TRANSFER' && payment.bankTransfer) {
      const { status } = payment.bankTransfer;

      if (status === 'PENDING') {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            입금 확인 중
          </span>
        );
      } else if (status === 'APPROVED') {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            입금 완료
          </span>
        );
      } else if (status === 'REJECTED') {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            입금 거절
          </span>
        );
      }
    }

    // 일반 결제 상태
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELED: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      PENDING: '결제 대기',
      COMPLETED: '결제 완료',
      FAILED: '결제 실패',
      CANCELED: '결제 취소',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[payment.status]}`}>
        {labels[payment.status]}
      </span>
    );
  };

  const getBankTransferStatusMessage = (payment: PaymentItem) => {
    console.log('Payment:', payment);
    console.log('BankTransfer:', payment.bankTransfer);

    if (payment.method !== 'BANK_TRANSFER' || !payment.bankTransfer) {
      console.log('Not bank transfer or no bankTransfer data');
      return null;
    }

    const { status, expectedDepositDate, rejectionReason, approvedAt, depositorName } = payment.bankTransfer;
    console.log('BankTransfer status:', status);

    if (status === 'PENDING') {
      return <BankTransferPendingInfo depositorName={depositorName} expectedDepositDate={expectedDepositDate} />;
    } else if (status === 'APPROVED') {
      return (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">입금이 확인되었습니다</p>
              <p className="text-xs text-green-700 mt-1">
                승인일: {approvedAt ? new Date(approvedAt).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </div>
      );
    } else if (status === 'REJECTED') {
      return (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">입금이 거절되었습니다</p>
              {rejectionReason && (
                <p className="text-xs text-red-700 mt-1">사유: {rejectionReason}</p>
              )}
              <p className="text-xs text-red-600 mt-1">
                다시 시도하시려면 강의 페이지에서 결제를 진행해주세요.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">결제 내역</h1>
          <p className="mt-2 text-gray-600">내 결제 내역과 상태를 확인할 수 있습니다</p>
        </div>

        {/* 결제 내역 */}
        {payments.length === 0 ? (
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <p className="text-gray-600 mb-4">결제 내역이 없습니다.</p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              강의 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex gap-6">
                    {/* 썸네일 */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden">
                        {payment.purchase.course.thumbnailUrl ? (
                          <img
                            src={payment.purchase.course.thumbnailUrl}
                            alt={payment.purchase.course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {payment.purchase.course.title}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>결제 방법: {getPaymentMethodLabel(payment.method)}</p>
                            <p>주문 번호: {payment.orderId}</p>
                            <p>
                              결제일: {new Date(payment.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="mb-2">{getPaymentStatusBadge(payment)}</div>
                          <p className="text-2xl font-bold text-gray-900">
                            ₩{payment.purchase.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* 무통장입금 상태 메시지 */}
                      {getBankTransferStatusMessage(payment)}

                      {/* 액션 버튼 */}
                      <div className="mt-4 flex gap-2">
                        {payment.purchase.status === 'COMPLETED' && (
                          <>
                            <Link
                              href={`/courses/${payment.purchase.course.id}`}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                              강의 보기
                            </Link>
                            <Link
                              href={`/receipts/${payment.purchase.id}`}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              영수증 보기
                            </Link>
                          </>
                        )}
                        {payment.method === 'BANK_TRANSFER' &&
                         payment.bankTransfer?.status === 'REJECTED' && (
                          <Link
                            href={`/checkout/${payment.purchase.course.id}`}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                          >
                            다시 결제하기
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
