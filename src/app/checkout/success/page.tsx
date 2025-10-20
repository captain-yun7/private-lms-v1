'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount: parseInt(amount) }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '결제 승인에 실패했습니다.');
        }

        const data = await response.json();
        setCourseId(data.courseId);
        setLoading(false);
      } catch (error: any) {
        console.error('결제 승인 오류:', error);
        setError(error.message || '결제 승인 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            결제를 처리하고 있습니다...
          </h1>
          <p className="text-text-secondary">
            잠시만 기다려주세요. 페이지를 닫지 마세요.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light p-4">
        <div className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">결제 실패</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link href="/courses" className="btn-primary inline-block">
            강의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light p-4">
      <div className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">결제 완료!</h1>
        <p className="text-text-secondary mb-6">
          강의 수강 등록이 완료되었습니다.<br />
          지금 바로 학습을 시작해보세요!
        </p>
        <div className="space-y-3">
          {courseId && (
            <Link href={`/learn/${courseId}`} className="btn-primary w-full block">
              학습 시작하기
            </Link>
          )}
          <Link href="/courses" className="btn-secondary w-full block">
            강의 목록 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
