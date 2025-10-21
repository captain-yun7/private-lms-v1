'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TiptapEditor from '@/components/TiptapEditor';

export default function EditInquiryPage() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchInquiry(params.id as string);
    }
  }, [params.id]);

  const fetchInquiry = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inquiries/${id}`);
      const data = await response.json();

      if (response.ok) {
        if (data.inquiry.status === 'ANSWERED') {
          alert('답변이 완료된 문의는 수정할 수 없습니다');
          router.push(`/inquiries/${id}`);
          return;
        }
        setTitle(data.inquiry.title);
        setContent(data.inquiry.content);
        setIsPrivate(data.inquiry.isPrivate);
      } else {
        alert(data.error || '문의를 불러오는데 실패했습니다');
        router.push('/mypage/inquiries');
      }
    } catch (error) {
      console.error('문의 로딩 실패:', error);
      alert('문의를 불러오는데 실패했습니다');
      router.push('/mypage/inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    if (content.length < 10) {
      alert('내용을 10자 이상 입력해주세요');
      return;
    }

    try {
      setSaveLoading(true);

      const response = await fetch(`/api/inquiries/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          isPrivate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('문의가 수정되었습니다');
        router.push(`/inquiries/${params.id}`);
      } else {
        alert(data.error || '문의 수정에 실패했습니다');
      }
    } catch (error) {
      console.error('문의 수정 실패:', error);
      alert('문의 수정에 실패했습니다');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">문의 수정</h1>
            <p className="text-gray-600">문의 내용을 수정하세요</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="문의 제목을 입력하세요"
                  maxLength={200}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="문의 내용을 자세히 작성해주세요 (최소 10자)"
                />
                <p className="mt-2 text-sm text-gray-500">
                  현재 {content.replace(/<[^>]*>/g, '').length}자
                </p>
              </div>

              {/* Private */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                  비밀글로 작성 (관리자만 볼 수 있습니다)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saveLoading ? '수정 중...' : '수정 완료'}
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
