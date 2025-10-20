'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light p-4">
      <div className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">결제 실패</h1>
        <p className="text-text-secondary mb-2">
          {message || '결제 처리 중 오류가 발생했습니다.'}
        </p>
        {code && (
          <p className="text-xs text-text-secondary mb-6">
            오류 코드: {code}
          </p>
        )}
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="btn-primary w-full"
          >
            다시 시도하기
          </button>
          <Link href="/courses" className="btn-secondary w-full block">
            강의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <FailContent />
    </Suspense>
  );
}
