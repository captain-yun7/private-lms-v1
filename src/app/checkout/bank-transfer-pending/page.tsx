'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PendingContent() {
  const searchParams = useSearchParams();
  const courseName = searchParams.get('courseName') || '강의';
  const amount = searchParams.get('amount');
  const depositorName = searchParams.get('depositorName');
  const bank = searchParams.get('bank') || '신한은행';
  const accountNumber = searchParams.get('accountNumber') || '110-123-456789';
  const accountHolder = searchParams.get('accountHolder') || '(주)Private LMS';

  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* 상태 아이콘 */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              입금 대기 중
            </h1>
            <p className="text-text-secondary">
              입금 확인 후 관리자가 승인하면 수강이 가능합니다.
            </p>
          </div>

          {/* 구매 정보 */}
          <div className="mb-8 p-4 bg-bg-light rounded-lg">
            <h2 className="font-semibold text-text-primary mb-3">구매 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">강의명</span>
                <span className="font-medium text-text-primary">{courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">결제 금액</span>
                <span className="font-medium text-text-primary">₩{parseInt(amount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">입금자명</span>
                <span className="font-medium text-text-primary">{depositorName}</span>
              </div>
            </div>
          </div>

          {/* 입금 계좌 정보 */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              입금 계좌 안내
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-blue-800">은행</span>
                <span className="font-bold text-blue-900">{bank}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-blue-800">계좌번호</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-900 font-mono">{accountNumber}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(accountNumber);
                      alert('계좌번호가 복사되었습니다.');
                    }}
                    className="p-1 hover:bg-blue-100 rounded"
                    title="복사"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-blue-800">예금주</span>
                <span className="font-bold text-blue-900">{accountHolder}</span>
              </div>
            </div>
          </div>

          {/* 안내 사항 */}
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">안내 사항</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 입금자명을 <strong>{depositorName}</strong>으로 정확히 입력해주세요.</li>
              <li>• 입금 확인 후 관리자 승인까지 영업일 기준 1~2일 소요됩니다.</li>
              <li>• 승인 완료 시 이메일로 알림이 발송됩니다.</li>
              <li>• 입금 후 3일 이내 미승인 시 고객센터로 문의해주세요.</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            <Link href="/courses" className="btn-primary w-full block text-center">
              강의 목록 보기
            </Link>
            <Link href="/mypage/payments" className="btn-secondary w-full block text-center">
              내 결제 내역 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BankTransferPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
