'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { loadTossPayments, TossPaymentsPayment } from '@tosspayments/tosspayments-sdk';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  instructorName: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'BANK_TRANSFER'>('CARD');
  const [processing, setProcessing] = useState(false);

  const tossPayments = useRef<TossPaymentsPayment | null>(null);

  // 구매자 정보
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // 무통장입금 정보
  const [bankTransferInfo, setBankTransferInfo] = useState({
    depositorName: '',
    expectedDepositDate: '',
  });

  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/checkout/${courseId}`);
      return;
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, status]);

  useEffect(() => {
    // 로그인한 사용자 정보로 초기값 설정
    if (session?.user) {
      setBuyerInfo({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
      });
    }
  }, [session]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('강의 조회 실패');

      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error('Error:', error);
      alert('강의 정보를 불러올 수 없습니다.');
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      alert('구매 약관에 동의해주세요.');
      return;
    }

    if (paymentMethod === 'CARD') {
      handleCardPayment();
    } else {
      handleBankTransfer();
    }
  };

  const handleCardPayment = async () => {
    if (!course) return;

    setProcessing(true);

    try {
      // 1. 결제 요청 API 호출
      const response = await fetch('/api/payments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          buyerName: buyerInfo.name,
          buyerEmail: buyerInfo.email,
          buyerPhone: buyerInfo.phone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '결제 요청에 실패했습니다.');
      }

      const paymentData = await response.json();

      // 2. 토스페이먼츠 SDK 초기화
      if (!tossPayments.current) {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          throw new Error('결제 설정이 올바르지 않습니다.');
        }
        const tp = await loadTossPayments(clientKey);
        tossPayments.current = tp.payment({
          customerKey: session?.user?.id || 'GUEST',
        });
      }

      // 3. 결제창 호출
      await tossPayments.current.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: paymentData.amount,
        },
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        // 전화번호에서 특수문자 제거 (숫자만)
        customerMobilePhone: paymentData.customerMobilePhone.replace(/[^0-9]/g, ''),
      });
    } catch (error: any) {
      console.error('결제 오류:', error);
      alert(error.message || '결제 처리 중 오류가 발생했습니다.');
      setProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    if (!course) return;

    if (!bankTransferInfo.depositorName || !bankTransferInfo.expectedDepositDate) {
      alert('입금자명과 입금 예정일을 입력해주세요.');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/payments/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          buyerName: buyerInfo.name,
          buyerEmail: buyerInfo.email,
          buyerPhone: buyerInfo.phone,
          depositorName: bankTransferInfo.depositorName,
          expectedDepositDate: bankTransferInfo.expectedDepositDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '무통장입금 요청에 실패했습니다.');
      }

      const data = await response.json();

      // 입금 대기 페이지로 이동
      const params = new URLSearchParams({
        courseName: data.courseName,
        amount: data.amount.toString(),
        depositorName: data.depositorName,
        bank: data.bankInfo.bank,
        accountNumber: data.bankInfo.accountNumber,
        accountHolder: data.bankInfo.accountHolder,
      });

      router.push(`/checkout/bank-transfer-pending?${params.toString()}`);
    } catch (error: any) {
      console.error('무통장입금 오류:', error);
      alert(error.message || '요청 처리 중 오류가 발생했습니다.');
      setProcessing(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/courses/${courseId}`} className="text-primary hover:underline text-sm mb-2 inline-block">
            ← 강의 페이지로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">결제하기</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 결제 정보 입력 */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 결제 수단 */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">결제 수단</h2>
                <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-semibold text-text-primary">카드 결제</div>
                    <div className="text-xs text-text-secondary mt-1">즉시 결제</div>
                  </div>
                </div>
              </div>

              {/* 구매자 정보 */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">구매자 정보</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      이름 *
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerInfo.name}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="홍길동"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerInfo.email}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      전화번호 *
                    </label>
                    <input
                      type="tel"
                      required
                      value={buyerInfo.phone}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="01012345678 (숫자만 입력)"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      - 없이 숫자만 입력해주세요
                    </p>
                  </div>
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
                  />
                  <span className="text-sm text-text-primary">
                    <span className="font-semibold">[필수]</span> 구매 조건 확인 및 결제 진행에 동의합니다.
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <Link href="/terms" className="text-primary hover:underline" target="_blank">
                        이용약관
                      </Link>
                      <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                        개인정보처리방침
                      </Link>
                      <Link href="/refund-policy" className="text-primary hover:underline" target="_blank">
                        환불정책
                      </Link>
                    </div>
                  </span>
                </label>
              </div>

              {/* 결제 버튼 */}
              <button
                type="submit"
                disabled={processing || !agreeTerms}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? '처리 중...' : paymentMethod === 'CARD' ? '결제하기' : '입금 정보 제출'}
              </button>
            </form>
          </div>

          {/* 주문 정보 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-text-primary mb-4">주문 정보</h2>

              {/* 강의 정보 */}
              <div className="mb-6">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{course.title}</h3>
                <p className="text-sm text-text-secondary">{course.instructorName}</p>
              </div>

              {/* 가격 정보 */}
              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>결제 금액</span>
                  <span>₩{course.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-bg-light rounded-lg">
                <p className="text-xs text-text-secondary">
                  ✓ 결제 후 즉시 수강 가능합니다<br />
                  ✓ 수강기한: 3개월<br />
                  ✓ 모든 기기 지원 (단, 최대 2대까지 등록 가능)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
