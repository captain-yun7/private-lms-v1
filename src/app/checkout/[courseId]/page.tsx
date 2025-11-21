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

  // 쿠폰 관련 상태
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

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

  // 쿠폰 적용 함수
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('쿠폰 코드를 입력해주세요.');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          courseId: courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '쿠폰 검증에 실패했습니다.');
      }

      setCouponDiscount(data.data);
      alert('쿠폰이 적용되었습니다!');
    } catch (error: any) {
      setCouponError(error.message || '쿠폰 적용에 실패했습니다.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // 쿠폰 제거 함수
  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(null);
    setCouponError('');
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
          couponCode: couponDiscount?.code,
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

      // 3. 결제창 호출 (쿠폰 ID를 메타데이터로 전달)
      await tossPayments.current.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: paymentData.amount,
        },
        orderId: paymentData.orderId,
        orderName: paymentData.orderName,
        successUrl: `${window.location.origin}/checkout/success${paymentData.couponId ? `?couponId=${paymentData.couponId}` : ''}`,
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
          couponCode: couponDiscount?.code,
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
              {/* 쿠폰 입력 */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">쿠폰 할인</h2>
                <div className="space-y-4">
                  {!couponDiscount ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="쿠폰 코드 입력"
                        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                        disabled={validatingCoupon}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validatingCoupon ? '확인 중...' : '적용'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-green-800">{couponDiscount.code}</p>
                          {couponDiscount.description && (
                            <p className="text-sm text-green-600 mt-1">{couponDiscount.description}</p>
                          )}
                          <p className="text-sm text-green-700 mt-2">
                            {couponDiscount.discountType === 'PERCENTAGE'
                              ? `${couponDiscount.discountValue}% 할인`
                              : `₩${couponDiscount.discountValue.toLocaleString()} 할인`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          제거
                        </button>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <p className="text-sm font-semibold text-green-800">
                          할인 금액: -₩{couponDiscount.discountAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-sm text-red-500">{couponError}</p>
                  )}
                </div>
              </div>

              {/* 결제 수단 선택 */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">결제 수단</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      paymentMethod === 'CARD'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-semibold text-text-primary">카드 결제</div>
                      <div className="text-xs text-text-secondary mt-1">즉시 결제</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏦</div>
                      <div className="font-semibold text-text-primary">무통장입금</div>
                      <div className="text-xs text-text-secondary mt-1">관리자 승인 필요</div>
                    </div>
                  </button>
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

              {/* 무통장입금 추가 정보 */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4">입금 정보</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        입금자명 *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankTransferInfo.depositorName}
                        onChange={(e) => setBankTransferInfo({ ...bankTransferInfo, depositorName: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="홍길동"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        입금 예정일 *
                      </label>
                      <input
                        type="date"
                        required
                        value={bankTransferInfo.expectedDepositDate}
                        onChange={(e) => setBankTransferInfo({ ...bankTransferInfo, expectedDepositDate: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium mb-2">입금 계좌 안내</p>
                      <p className="text-sm text-blue-800">
                        신한은행 110-123-456789<br />
                        예금주: (주)Private LMS
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                    <Link href="/terms" className="text-primary hover:underline ml-1" target="_blank">
                      이용약관 보기
                    </Link>
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
                <div className="flex justify-between text-text-primary">
                  <span>강의 가격</span>
                  <span className="font-semibold">₩{course.price.toLocaleString()}</span>
                </div>

                {couponDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>쿠폰 할인</span>
                    <span>-₩{couponDiscount.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-primary pt-3 border-t border-border">
                  <span>최종 결제 금액</span>
                  <span>₩{(couponDiscount ? couponDiscount.finalAmount : course.price).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-bg-light rounded-lg">
                <p className="text-xs text-text-secondary">
                  ✓ 결제 후 즉시 수강 가능합니다<br />
                  ✓ 평생 수강 가능<br />
                  ✓ 모든 기기에서 시청 가능
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
