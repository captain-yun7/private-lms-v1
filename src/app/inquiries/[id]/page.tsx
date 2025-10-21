'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface InquiryReply {
  id: string;
  content: string;
  createdAt: string;
  admin: {
    name: string | null;
  };
}

interface Inquiry {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    name: string | null;
    email: string | null;
  };
  replies: InquiryReply[];
}

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        setInquiry(data.inquiry);
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

  const handleDelete = async () => {
    if (!inquiry) return;

    if (!confirm('정말 이 문의를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('문의가 삭제되었습니다');
        router.push('/mypage/inquiries');
      } else {
        alert(data.error || '문의 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('문의 삭제 실패:', error);
      alert('문의 삭제에 실패했습니다');
    } finally {
      setDeleteLoading(false);
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

  if (!inquiry) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Link
            href="/mypage/inquiries"
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

          {/* Inquiry */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {inquiry.status === 'ANSWERED' ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        답변완료
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        답변대기
                      </span>
                    )}
                    {inquiry.isPrivate && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        🔒 비밀글
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {inquiry.title}
                  </h1>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span>{inquiry.user.name || '익명'}</span>
                    <span>{formatDate(inquiry.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: inquiry.content }}
              />
            </div>
          </div>

          {/* Replies */}
          {inquiry.replies.length > 0 && (
            <div className="bg-blue-50 shadow-sm rounded-lg overflow-hidden mb-6">
              <div className="px-8 py-6 border-b border-blue-100 bg-blue-100">
                <h2 className="text-xl font-bold text-gray-900">관리자 답변</h2>
              </div>
              <div className="px-8 py-8">
                {inquiry.replies.map((reply) => (
                  <div key={reply.id} className="mb-6 last:mb-0">
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="font-medium text-primary">
                        {reply.admin.name || '관리자'}
                      </span>
                      <span className="mx-2">·</span>
                      <span>{formatDate(reply.createdAt)}</span>
                    </div>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {inquiry.status === 'PENDING' && (
              <>
                <Link
                  href={`/inquiries/${inquiry.id}/edit`}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  수정
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? '삭제 중...' : '삭제'}
                </button>
              </>
            )}
            <Link
              href="/mypage/inquiries"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium ml-auto"
            >
              목록으로
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
