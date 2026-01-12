'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    instructorName: '',
    instructorIntro: '',
    thumbnailUrl: '',
    enrollmentDuration: '3', // 기본값 3개월
    isPublished: false,
  });

  // 썸네일 이미지 업로드 핸들러
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 확인 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    setUploadingThumbnail(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/courses/thumbnail', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('썸네일 업로드 실패');
      }

      const data = await response.json();

      // 미리보기 설정
      setThumbnailPreview(data.fileUrl);

      // formData에 URL 저장
      setFormData({ ...formData, thumbnailUrl: data.fileUrl });

      alert('썸네일이 업로드되었습니다.');
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      alert('썸네일 업로드에 실패했습니다.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          enrollmentDuration: formData.enrollmentDuration === '' ? null : parseInt(formData.enrollmentDuration),
        }),
      });

      if (!response.ok) {
        throw new Error('강의 생성 실패');
      }

      const course = await response.json();
      router.push(`/admin/courses/${course.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('강의 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">강의 추가</h1>
        <p className="mt-2 text-gray-600">새로운 강의를 추가합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* 기본 정보 */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의 제목 *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="예: JavaScript 기초부터 실무까지"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의 설명 *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="강의에 대한 자세한 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가격 (원) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수강 기간 *
              </label>
              <select
                value={formData.enrollmentDuration}
                onChange={(e) => setFormData({ ...formData, enrollmentDuration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="1">1개월</option>
                <option value="2">2개월</option>
                <option value="3">3개월</option>
                <option value="6">6개월</option>
                <option value="12">12개월</option>
                <option value="">무제한</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                수강 등록 후 해당 기간 동안 강의를 시청할 수 있습니다
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                썸네일 이미지
              </label>

              {/* 파일 업로드 버튼 */}
              <div className="mb-3">
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">
                    {uploadingThumbnail ? '업로드 중...' : '이미지 업로드'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP, GIF (최대 10MB)</p>
              </div>

              {/* 미리보기 */}
              {(thumbnailPreview || formData.thumbnailUrl) && (
                <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">미리보기 (실제 강의 카드 비율)</p>
                  <div className="max-w-md">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={thumbnailPreview || formData.thumbnailUrl}
                        alt="썸네일 미리보기"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* URL 직접 입력 (선택적) */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-900 mb-2">
                  또는 URL 직접 입력
                </summary>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, thumbnailUrl: e.target.value });
                    setThumbnailPreview(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </details>
            </div>
          </div>
        </div>

        {/* 강사 정보 */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">강사 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강사 이름 *
              </label>
              <input
                type="text"
                required
                value={formData.instructorName}
                onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강사 소개
              </label>
              <textarea
                value={formData.instructorIntro}
                onChange={(e) => setFormData({ ...formData, instructorIntro: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="강사에 대한 소개를 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* 공개 설정 */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">공개 설정</h2>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">
              강의를 즉시 공개 (체크하지 않으면 비공개 상태로 저장됩니다)
            </span>
          </label>
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? '저장 중...' : '강의 생성'}
          </button>
        </div>
      </form>
    </div>
  );
}
