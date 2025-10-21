'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TaxInvoiceRequestPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessNumber: '',
    companyName: '',
    ceoName: '',
    address: '',
    businessType: '',
    businessItem: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessNumber || formData.businessNumber.length < 10) {
      alert('사업자등록번호를 정확히 입력해주세요');
      return;
    }

    if (!formData.companyName || !formData.ceoName || !formData.address) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    if (!formData.email || !formData.phone) {
      alert('이메일과 연락처를 입력해주세요');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/tax-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseId: params.purchaseId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('세금계산서 발급 요청이 완료되었습니다.\n관리자 승인 후 이메일로 발송됩니다.');
        router.push('/mypage/payments');
      } else {
        alert(data.error || '세금계산서 발급 요청에 실패했습니다');
      }
    } catch (error) {
      console.error('세금계산서 발급 요청 실패:', error);
      alert('세금계산서 발급 요청에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              세금계산서 발급 요청
            </h1>
            <p className="text-gray-600">
              사업자 정보를 입력하시면 관리자 승인 후 세금계산서가 발급됩니다
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-8">
            <div className="space-y-6">
              {/* Business Number */}
              <div>
                <label
                  htmlFor="businessNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  사업자등록번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="businessNumber"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="123-45-67890"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  '-' 포함하여 입력해주세요
                </p>
              </div>

              {/* Company Name */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  상호명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="(주)홍길동컴퍼니"
                  required
                />
              </div>

              {/* CEO Name */}
              <div>
                <label
                  htmlFor="ceoName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  대표자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ceoName"
                  name="ceoName"
                  value={formData.ceoName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="홍길동"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  사업장 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="서울특별시 강남구 테헤란로 123"
                  required
                />
              </div>

              {/* Business Type */}
              <div>
                <label
                  htmlFor="businessType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  업태 (선택)
                </label>
                <input
                  type="text"
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="서비스업"
                />
              </div>

              {/* Business Item */}
              <div>
                <label
                  htmlFor="businessItem"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  종목 (선택)
                </label>
                <input
                  type="text"
                  id="businessItem"
                  name="businessItem"
                  value={formData.businessItem}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="교육서비스"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="company@example.com"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  세금계산서가 발송될 이메일 주소입니다
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="010-1234-5678"
                  required
                />
              </div>

              {/* Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  안내사항
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>세금계산서는 관리자 승인 후 발급됩니다</li>
                  <li>입력하신 이메일로 세금계산서가 발송됩니다</li>
                  <li>발급까지 1-2 영업일이 소요될 수 있습니다</li>
                  <li>사업자등록번호를 정확히 입력해주세요</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? '요청 중...' : '발급 요청'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
