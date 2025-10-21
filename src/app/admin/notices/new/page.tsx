'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('공지사항이 작성되었습니다');
        router.push('/admin/notices');
      } else {
        alert(data.error || '공지사항 작성에 실패했습니다');
      }
    } catch (error) {
      console.error('공지사항 작성 실패:', error);
      alert('공지사항 작성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">공지사항 작성</h1>
            <p className="mt-2 text-gray-600">
              새로운 공지사항을 작성합니다
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow-sm rounded-lg p-8 max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="공지사항 제목을 입력하세요"
                  required
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={15}
                  placeholder="공지사항 내용을 입력하세요&#10;&#10;HTML 태그를 사용할 수 있습니다.&#10;예: <strong>굵은 글씨</strong>, <em>이탤릭</em>, <br/>줄바꿈 등"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  HTML 태그를 사용하여 서식을 지정할 수 있습니다.
                </p>
              </div>

              {/* 중요 공지 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) =>
                    setFormData({ ...formData, isPinned: e.target.checked })
                  }
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="isPinned"
                  className="ml-2 block text-sm text-gray-700"
                >
                  중요 공지로 설정 (목록 상단에 고정됩니다)
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Link
                  href="/admin/notices"
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '작성 중...' : '작성 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
