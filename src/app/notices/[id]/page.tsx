'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Notice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

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
      } else {
        alert(data.error || '공지사항을 불러오는데 실패했습니다');
        router.push('/notices');
      }
    } catch (error) {
      console.error('공지사항 로딩 실패:', error);
      alert('공지사항을 불러오는데 실패했습니다');
      router.push('/notices');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (!notice) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Link
            href="/notices"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            목록으로
          </Link>

          {/* Notice Content */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {notice.isPinned && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-3">
                      📌 중요 공지
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {notice.title}
                  </h1>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(notice.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {notice.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: notice.content }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/notices"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
