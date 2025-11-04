'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor from '@/components/TiptapEditor';

interface Notice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
}

export default function AdminNoticeEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  });

  useEffect(() => {
    if (params.id) {
      fetchNotice(params.id as string);
    }
  }, [params.id]);

  const fetchNotice = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notices/${id}`);
      const data = await response.json();

      if (response.ok) {
        setNotice(data.notice);
        setFormData({
          title: data.notice.title,
          content: data.notice.content,
          isPinned: data.notice.isPinned,
        });
      } else {
        alert(data.error || '공지사항을 불러오는데 실패했습니다');
        router.push('/admin/notices');
      }
    } catch (error) {
      console.error('공지사항 로딩 실패:', error);
      alert('공지사항을 불러오는데 실패했습니다');
      router.push('/admin/notices');
    } finally {
      setLoading(false);
    }
  };

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
      setSaveLoading(true);

      const response = await fetch(`/api/admin/notices/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('공지사항이 수정되었습니다');
        router.push('/admin/notices');
      } else {
        alert(data.error || '공지사항 수정에 실패했습니다');
      }
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      alert('공지사항 수정에 실패했습니다');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!notice) {
    return null;
  }

  return (
    <>
      <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">공지사항 수정</h1>
            <p className="mt-2 text-gray-600">
              공지사항 내용을 수정합니다
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
                <TiptapEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="공지사항 내용을 입력하세요"
                />
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
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveLoading ? '저장 중...' : '수정 완료'}
                </button>
              </div>
            </form>
          </div>
      </div>
    </>
  );
}
