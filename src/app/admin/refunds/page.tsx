"use client";

import { useEffect, useState } from "react";

interface Refund {
  id: string;
  reason: string;
  refundAmount: number;
  accountBank: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  rejectReason: string | null;
  purchase: {
    user: {
      name: string;
      email: string;
      phone: string | null;
    };
    course: {
      title: string;
    };
    payment: {
      method: string;
      paymentKey: string | null;
    };
  };
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [filteredRefunds, setFilteredRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, []);

  useEffect(() => {
    filterRefunds();
  }, [selectedStatus, refunds]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/refunds?status=${selectedStatus}`);

      if (!response.ok) {
        throw new Error("환불 목록 조회 실패");
      }

      const data = await response.json();
      setRefunds(data.refunds);
    } catch (err) {
      console.error("환불 목록 조회 에러:", err);
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const filterRefunds = () => {
    if (selectedStatus === "ALL") {
      setFilteredRefunds(refunds);
    } else {
      setFilteredRefunds(refunds.filter((r) => r.status === selectedStatus));
    }
  };

  const handleApprove = async (refund: Refund) => {
    if (
      !confirm(
        `${refund.purchase.user.name}님의 환불 신청을 승인하시겠습니까?\n강의: ${refund.purchase.course.title}\n금액: ${refund.refundAmount.toLocaleString()}원`
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/refunds/${refund.id}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "환불 승인 실패");
      }

      alert(data.message);
      fetchRefunds(); // 목록 새로고침
    } catch (err) {
      console.error("환불 승인 에러:", err);
      alert(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (refund: Refund) => {
    setSelectedRefund(refund);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedRefund) return;

    if (rejectReason.length < 10) {
      alert("거절 사유를 10자 이상 입력해주세요");
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(
        `/api/admin/refunds/${selectedRefund.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectReason }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "환불 거절 실패");
      }

      alert(data.message);
      setShowRejectModal(false);
      fetchRefunds(); // 목록 새로고침
    } catch (err) {
      console.error("환불 거절 에러:", err);
      alert(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-blue-100 text-blue-800",
      REJECTED: "bg-red-100 text-red-800",
      COMPLETED: "bg-green-100 text-green-800",
    };

    const labels: Record<string, string> = {
      PENDING: "승인 대기",
      APPROVED: "승인됨",
      REJECTED: "거절됨",
      COMPLETED: "완료",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPaymentMethodName = (method: string) => {
    return method === "CARD" ? "카드 결제" : "무통장입금";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">환불 관리</h1>
            <p className="text-gray-600">환불 신청 내역을 확인하고 승인/거절할 수 있습니다</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 필터 */}
          <div className="mb-6 flex gap-2">
            {["ALL", "PENDING", "COMPLETED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {status === "ALL"
                  ? "전체"
                  : status === "PENDING"
                  ? "승인 대기"
                  : status === "COMPLETED"
                  ? "완료"
                  : "거절"}
                {status !== "ALL" &&
                  ` (${refunds.filter((r) => r.status === status).length})`}
              </button>
            ))}
          </div>

          {/* 환불 목록 */}
          {filteredRefunds.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">환불 신청 내역이 없습니다</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                      결제 수단
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      환불 금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      신청일
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
                  {filteredRefunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {refund.purchase.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {refund.purchase.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {refund.purchase.course.title}
                        </div>
                        <details className="mt-1">
                          <summary className="text-xs text-blue-600 cursor-pointer">
                            환불 사유 보기
                          </summary>
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {refund.reason}
                          </p>
                        </details>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getPaymentMethodName(refund.purchase.payment.method)}
                        {refund.purchase.payment.method === "BANK_TRANSFER" &&
                          refund.accountBank && (
                            <div className="text-xs text-gray-500 mt-1">
                              {refund.accountBank} {refund.accountNumber}
                              <br />
                              {refund.accountHolder}
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {refund.refundAmount.toLocaleString()}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(refund.requestedAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(refund.status)}
                        {refund.status === "REJECTED" && refund.rejectReason && (
                          <details className="mt-1">
                            <summary className="text-xs text-red-600 cursor-pointer">
                              거절 사유
                            </summary>
                            <p className="mt-1 text-xs text-gray-600">
                              {refund.rejectReason}
                            </p>
                          </details>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {refund.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(refund)}
                              disabled={processing}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => openRejectModal(refund)}
                              disabled={processing}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              거절
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

      {/* 거절 사유 입력 모달 */}
      {showRejectModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">환불 거절</h2>
            <p className="text-gray-600 mb-4">
              거절 사유를 입력해주세요. 사용자에게 전달됩니다.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="거절 사유 (최소 10자)"
            />
            <p className="text-sm text-gray-500 mt-1">
              {rejectReason.length}/10자 이상
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                disabled={processing || rejectReason.length < 10}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? "처리 중..." : "거절"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
