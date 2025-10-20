'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Video {
  id: string;
  vimeoUrl: string;
  vimeoId: string | null;
  title: string;
  description: string | null;
  duration: number | null;
  order: number;
  isPreview: boolean;
}

interface CourseFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  instructorName: string;
  instructorIntro: string | null;
  isPublished: boolean;
  videos: Video[];
  files: CourseFile[];
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    instructorName: '',
    instructorIntro: '',
    thumbnailUrl: '',
    isPublished: false,
  });

  // 영상 추가 폼 상태
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file'); // 'file' or 'url'
  const [videoFormData, setVideoFormData] = useState({
    vimeoUrl: '',
    title: '',
    description: '',
    isPreview: false,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // 강의 자료 관리 상태
  const [showFileForm, setShowFileForm] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      if (!response.ok) throw new Error('강의 조회 실패');

      const data = await response.json();
      setCourse(data);
      setFormData({
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        instructorName: data.instructorName,
        instructorIntro: data.instructorIntro || '',
        thumbnailUrl: data.thumbnailUrl || '',
        isPublished: data.isPublished,
      });
    } catch (error) {
      console.error('Error:', error);
      alert('강의를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
        }),
      });

      if (!response.ok) throw new Error('강의 수정 실패');

      alert('강의가 수정되었습니다.');
      fetchCourse();
    } catch (error) {
      console.error('Error:', error);
      alert('강의 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMethod === 'file') {
      // 파일 업로드 방식
      await handleFileUpload();
    } else {
      // URL 입력 방식
      await handleUrlUpload();
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      alert('파일을 선택해주세요');
      return;
    }

    if (!videoFormData.title) {
      alert('영상 제목을 입력해주세요');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', videoFormData.title);
      formData.append('description', videoFormData.description);
      formData.append('isPreview', videoFormData.isPreview.toString());

      const response = await fetch(`/api/admin/courses/${courseId}/videos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '영상 업로드 실패');
      }

      alert('영상이 업로드되었습니다.');
      setShowVideoForm(false);
      setVideoFormData({
        vimeoUrl: '',
        title: '',
        description: '',
        isPreview: false,
      });
      setUploadFile(null);
      fetchCourse();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '영상 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoFormData),
      });

      if (!response.ok) throw new Error('영상 추가 실패');

      alert('영상이 추가되었습니다.');
      setShowVideoForm(false);
      setVideoFormData({
        vimeoUrl: '',
        title: '',
        description: '',
        isPreview: false,
      });
      fetchCourse();
    } catch (error) {
      console.error('Error:', error);
      alert('영상 추가에 실패했습니다.');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('이 영상을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('영상 삭제 실패');

      alert('영상이 삭제되었습니다.');
      fetchCourse();
    } catch (error) {
      console.error('Error:', error);
      alert('영상 삭제에 실패했습니다.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('이 강의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('강의 삭제 실패');

      alert('강의가 삭제되었습니다.');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error:', error);
      alert('강의 삭제에 실패했습니다.');
    }
  };

  const moveVideo = async (videoId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/videos/${videoId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) throw new Error('순서 변경 실패');

      fetchCourse();
    } catch (error) {
      console.error('Error:', error);
      alert('순서 변경에 실패했습니다.');
    }
  };

  // 드래그 앤 드롭으로 순서 변경
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = course?.videos.findIndex((v) => v.id === active.id);
    const newIndex = course?.videos.findIndex((v) => v.id === over.id);

    if (oldIndex === undefined || newIndex === undefined || !course) {
      return;
    }

    // 낙관적 UI 업데이트
    const newVideos = arrayMove(course.videos, oldIndex, newIndex);
    setCourse({ ...course, videos: newVideos });

    // 서버에 순서 변경 요청
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/videos/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoIds: newVideos.map((v) => v.id),
        }),
      });

      if (!response.ok) {
        throw new Error('순서 변경 실패');
      }

      // 서버에서 최신 데이터 다시 가져오기
      fetchCourse();
    } catch (error) {
      console.error('Error:', error);
      alert('순서 변경에 실패했습니다.');
      // 실패 시 원래 데이터로 복구
      fetchCourse();
    }
  };

  // 강의 자료 업로드
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileToUpload) {
      alert('파일을 선택해주세요');
      return;
    }

    setFileUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await fetch(`/api/admin/courses/${courseId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '파일 업로드 실패');
      }

      alert('파일이 업로드되었습니다.');
      setShowFileForm(false);
      setFileToUpload(null);
      fetchCourse();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '파일 업로드에 실패했습니다.');
    } finally {
      setFileUploading(false);
    }
  };

  // 강의 자료 삭제
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('파일 삭제 실패');

      alert('파일이 삭제되었습니다.');
      fetchCourse();
    } catch (error) {
      console.error('Error:', error);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Sortable Video Item 컴포넌트
  const SortableVideoItem = ({ video, index }: { video: Video; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: video.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* 드래그 핸들 */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab-custom active:cursor-grabbing-custom p-2 hover:bg-gray-100 rounded transition-colors select-none"
            title="드래그하여 순서 변경"
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="9" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="15" cy="19" r="1.5" />
            </svg>
          </div>

          {/* 순서 변경 버튼 (보조) */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => moveVideo(video.id, 'up')}
              disabled={index === 0}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
              title="위로 이동"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => moveVideo(video.id, 'down')}
              disabled={index === course?.videos.length! - 1}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
              title="아래로 이동"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{video.order}. {video.title}</span>
              {video.isPreview && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  미리보기
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{video.vimeoUrl}</p>
          </div>
        </div>
        <button
          onClick={() => handleDeleteVideo(video.id)}
          className="px-3 py-1 text-red-600 hover:text-red-900"
        >
          삭제
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">강의를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">강의 수정</h1>
        <p className="mt-2 text-gray-600">{course.title}</p>
      </div>

      {/* 기본 정보 수정 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">강의 제목 *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">강의 설명 *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">가격 (원) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">강사 이름 *</label>
              <input
                type="text"
                required
                value={formData.instructorName}
                onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">강사 소개</label>
            <textarea
              value={formData.instructorIntro}
              onChange={(e) => setFormData({ ...formData, instructorIntro: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">썸네일 URL</label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">강의 공개</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleDeleteCourse}
            className="px-6 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
          >
            강의 삭제
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>
      </form>

      {/* 영상 관리 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">영상 관리 ({course.videos.length}개)</h2>
          <button
            onClick={() => setShowVideoForm(!showVideoForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {showVideoForm ? '취소' : '+ 영상 추가'}
          </button>
        </div>

        {showVideoForm && (
          <form onSubmit={handleAddVideo} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              {/* 업로드 방식 선택 */}
              <div className="flex gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="file"
                    checked={uploadMethod === 'file'}
                    onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">파일 업로드</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="url"
                    checked={uploadMethod === 'url'}
                    onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Vimeo URL 입력</span>
                </label>
              </div>

              {uploadMethod === 'file' ? (
                <>
                  {/* 파일 업로드 방식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">영상 파일 *</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={uploading}
                    />
                    {uploadFile && (
                      <p className="mt-1 text-sm text-gray-500">
                        선택된 파일: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* URL 입력 방식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vimeo URL *</label>
                    <input
                      type="url"
                      required={uploadMethod === 'url'}
                      value={videoFormData.vimeoUrl}
                      onChange={(e) => setVideoFormData({ ...videoFormData, vimeoUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://vimeo.com/123456789"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">영상 제목 *</label>
                <input
                  type="text"
                  required
                  value={videoFormData.title}
                  onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">영상 설명</label>
                <textarea
                  value={videoFormData.description}
                  onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={videoFormData.isPreview}
                    onChange={(e) => setVideoFormData({ ...videoFormData, isPreview: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    disabled={uploading}
                  />
                  <span className="ml-2 text-sm text-gray-700">미리보기 영상으로 설정</span>
                </label>
              </div>

              {uploading && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">영상 업로드 중...</p>
                  <p className="text-xs text-blue-700">업로드가 완료될 때까지 기다려주세요. 시간이 오래 걸릴 수 있습니다.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '업로드 중...' : uploadMethod === 'file' ? '파일 업로드' : '영상 추가'}
              </button>
            </div>
          </form>
        )}

        {course.videos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">등록된 영상이 없습니다</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={course.videos.map(v => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {course.videos
                  .sort((a, b) => a.order - b.order)
                  .map((video, index) => (
                    <SortableVideoItem
                      key={video.id}
                      video={video}
                      index={index}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* 강의 자료 관리 */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">강의 자료 관리 ({course.files?.length || 0}개)</h2>
          <button
            onClick={() => setShowFileForm(!showFileForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {showFileForm ? '취소' : '+ 파일 추가'}
          </button>
        </div>

        {showFileForm && (
          <form onSubmit={handleFileUploadSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">파일 선택 *</label>
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={fileUploading}
                />
                {fileToUpload && (
                  <p className="mt-1 text-sm text-gray-500">
                    선택된 파일: {fileToUpload.name} ({formatFileSize(fileToUpload.size)})
                  </p>
                )}
              </div>

              {fileUploading && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">파일 업로드 중...</p>
                  <p className="text-xs text-blue-700">업로드가 완료될 때까지 기다려주세요.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={fileUploading || !fileToUpload}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fileUploading ? '업로드 중...' : '파일 업로드'}
              </button>
            </div>
          </form>
        )}

        {!course.files || course.files.length === 0 ? (
          <p className="text-gray-500 text-center py-8">등록된 파일이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {course.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <svg className="w-8 h-8 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.fileName}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-primary hover:text-primary-dark"
                  >
                    다운로드
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="px-3 py-1 text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
