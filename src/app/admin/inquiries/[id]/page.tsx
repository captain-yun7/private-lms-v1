'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor from '@/components/TiptapEditor';

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
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  replies: InquiryReply[];
}

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchInquiry(params.id as string);
    }
  }, [params.id]);

  const fetchInquiry = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/inquiries/${id}`);
      const data = await response.json();

      if (response.ok) {
        setInquiry(data.inquiry);
      } else {
        alert(data.error || '문의를 불러오는데 실패했습니다');
        router.push('/admin/inquiries');
      }
    } catch (error) {
      console.error('문의 로딩 실패:', error);
      alert('문의를 불러오는데 실패했습니다');
      router.push('/admin/inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inquiry) return;

    if (replyContent.length < 10) {
      alert('답변 내용을 10자 이상 입력해주세요');
      return;
    }

    try {
      setReplyLoading(true);

      const response = await fetch(`/api/admin/inquiries/${inquiry.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('답변이 등록되었습니다');
        // 문의 다시 불러오기
        fetchInquiry(inquiry.id);
        setReplyContent('');
      } else {
        alert(data.error || '답변 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert('답변 등록에 실패했습니다');
    } finally {
      setReplyLoading(false);
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
        <div>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    );
  }

  if (!inquiry) {
    return null;
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">문의 상세</h1>
            <p className="mt-2 text-gray-600">문의 내용을 확인하고 답변하세요</p>
          </div>
          <Link
            href="/admin/inquiries"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            목록으로
          </Link>
        </div>

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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {inquiry.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 gap-4">
                  <div>
                    <span className="font-medium">{inquiry.user.name || '익명'}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span>{inquiry.user.email}</span>
                  </div>
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

        {/* Existing Replies */}
        {inquiry.replies.length > 0 && (
          <div className="bg-blue-50 shadow-sm rounded-lg overflow-hidden mb-6">
            <div className="px-8 py-6 border-b border-blue-100 bg-blue-100">
              <h3 className="text-xl font-bold text-gray-900">작성된 답변</h3>
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

        {/* Reply Form */}
        {inquiry.status === 'PENDING' && (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">답변 작성</h3>
            <form onSubmit={handleReplySubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    답변 내용 <span className="text-red-500">*</span>
                  </label>
                  <TiptapEditor
                    content={replyContent}
                    onChange={setReplyContent}
                    placeholder="답변 내용을 작성해주세요 (최소 10자)"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    현재 {replyContent.replace(/<[^>]*>/g, '').length}자
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={replyLoading}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {replyLoading ? '등록 중...' : '답변 등록'}
                  </button>
                  <Link
                    href="/admin/inquiries"
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    취소
                  </Link>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
