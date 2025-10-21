"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Receipt {
  id: string;
  receiptNumber: string;
  amount: number;
  issuedAt: string;
  purchase: {
    user: {
      name: string;
      email: string;
      phone: string | null;
    };
    course: {
      title: string;
      instructorName: string;
    };
    payment: {
      method: string;
      paidAt: string;
      orderId: string;
      paymentKey: string | null;
    };
  };
}

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchReceipt(params.id as string);
    }
  }, [status, params.id]);

  const fetchReceipt = async (receiptId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/receipts/${receiptId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "영수증을 불러올 수 없습니다");
      }

      const data = await response.json();
      setReceipt(data.receipt);
    } catch (err) {
      console.error("영수증 조회 에러:", err);
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ko-KR");
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      CARD: "신용/체크카드",
      BANK_TRANSFER: "무통장입금",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">영수증을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/mypage/payments")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              결제 내역으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 인쇄 버튼 (인쇄 시 숨김) */}
        <div className="mb-6 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🖨️ 인쇄하기
          </button>
        </div>

        {/* 영수증 */}
        <div className="bg-white rounded-lg shadow-lg p-12 print:shadow-none">
          {/* 헤더 */}
          <div className="text-center mb-10 border-b-2 border-gray-900 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">영수증</h1>
            <p className="text-sm text-gray-600">Receipt</p>
          </div>

          {/* 영수증 정보 */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-sm text-gray-600">영수증 번호</p>
                <p className="font-mono font-semibold">{receipt.receiptNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">발행일시</p>
                <p className="font-semibold">{formatDate(receipt.issuedAt)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">주문번호</p>
                <p className="font-mono text-sm">{receipt.purchase.payment.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">결제일시</p>
                <p className="font-semibold">{formatDate(receipt.purchase.payment.paidAt)}</p>
              </div>
            </div>
          </div>

          {/* 구매자 정보 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              구매자 정보
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">성명</p>
                <p className="font-semibold">{receipt.purchase.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">이메일</p>
                <p className="font-semibold">{receipt.purchase.user.email}</p>
              </div>
              {receipt.purchase.user.phone && (
                <div>
                  <p className="text-sm text-gray-600">연락처</p>
                  <p className="font-semibold">{receipt.purchase.user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              상품 정보
            </h2>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    강의명
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    강사
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    금액
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-4">{receipt.purchase.course.title}</td>
                  <td className="px-4 py-4">{receipt.purchase.course.instructorName}</td>
                  <td className="px-4 py-4 text-right">
                    {formatAmount(receipt.amount)}원
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 결제 정보 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              결제 정보
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">결제 수단</p>
                <p className="font-semibold">
                  {getPaymentMethodName(receipt.purchase.payment.method)}
                </p>
              </div>
              {receipt.purchase.payment.paymentKey && (
                <div>
                  <p className="text-sm text-gray-600">결제 키</p>
                  <p className="font-mono text-xs">{receipt.purchase.payment.paymentKey}</p>
                </div>
              )}
            </div>
          </div>

          {/* 총 결제 금액 */}
          <div className="border-t-2 border-gray-900 pt-6">
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold text-gray-900">총 결제 금액</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatAmount(receipt.amount)}원
              </p>
            </div>
          </div>

          {/* 발행처 정보 */}
          <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-2">Private LMS</p>
            <p>본 영수증은 전자문서이며 법적 효력이 있습니다.</p>
            <p className="mt-1">문의사항이 있으시면 고객센터로 연락주시기 바랍니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
