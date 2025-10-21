"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RefundRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [formData, setFormData] = useState({
    reason: "",
    accountBank: "",
    accountNumber: "",
    accountHolder: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (formData.reason.length < 10) {
      setError("환불 사유를 10자 이상 입력해주세요");
      return;
    }

    // 무통장입금인 경우 계좌 정보 필수
    if (paymentMethod === "BANK_TRANSFER") {
      if (
        !formData.accountBank ||
        !formData.accountNumber ||
        !formData.accountHolder
      ) {
        setError("환불 계좌 정보를 모두 입력해주세요");
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch("/api/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseId: params.purchaseId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "환불 신청에 실패했습니다");
      }

      alert("환불 신청이 완료되었습니다. 관리자 승인 후 처리됩니다.");
      router.push("/mypage/payments");
    } catch (err) {
      console.error("환불 신청 에러:", err);
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">환불 신청</h1>
          <p className="text-gray-600 mb-8">
            환불 사유를 작성해주세요. 관리자 검토 후 처리됩니다.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 환불 사유 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                환불 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="환불 사유를 상세히 작성해주세요 (최소 10자)"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.reason.length}/10자 이상
              </p>
            </div>

            {/* 결제 수단 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                결제 수단 <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">선택해주세요</option>
                <option value="CARD">카드 결제</option>
                <option value="BANK_TRANSFER">무통장입금</option>
              </select>
            </div>

            {/* 무통장입금인 경우 환불 계좌 정보 */}
            {paymentMethod === "BANK_TRANSFER" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">
                  환불 계좌 정보
                </h3>
                <p className="text-sm text-gray-600">
                  무통장입금으로 결제하신 경우, 환불받으실 계좌 정보를
                  입력해주세요.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    은행명
                  </label>
                  <input
                    type="text"
                    value={formData.accountBank}
                    onChange={(e) =>
                      setFormData({ ...formData, accountBank: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 신한은행"
                    required={paymentMethod === "BANK_TRANSFER"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    계좌번호
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="- 없이 입력"
                    required={paymentMethod === "BANK_TRANSFER"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    예금주명
                  </label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountHolder: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예금주명"
                    required={paymentMethod === "BANK_TRANSFER"}
                  />
                </div>
              </div>
            )}

            {/* 환불 정책 안내 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                환불 정책 안내
              </h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>환불 신청 후 관리자 승인까지 1-2 영업일이 소요됩니다</li>
                <li>카드 결제: 카드사를 통해 자동 환불 처리됩니다</li>
                <li>무통장입금: 입력하신 계좌로 환불금이 입금됩니다</li>
                <li>
                  환불 승인 후 수강 등록이 자동으로 취소되며, 강의를 수강할 수
                  없습니다
                </li>
              </ul>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "처리 중..." : "환불 신청"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
