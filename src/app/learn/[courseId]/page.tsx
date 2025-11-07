'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import DeviceVerifiedPlayer from '@/components/DeviceVerifiedPlayer';

interface Video {
  id: string;
  title: string;
  description: string | null;
  vimeoUrl: string;
  vimeoId: string | null;
  duration: number;
  order: number;
  isPreview: boolean;
}

interface Progress {
  id: string;
  lastPosition: number;
  isCompleted: boolean;
  completedAt: string | null;
}

interface CourseFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  videos: Video[];
  files: CourseFile[];
  isEnrolled: boolean;
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [progresses, setProgresses] = useState<Map<string, Progress>>(new Map());
  const [lastSavedPosition, setLastSavedPosition] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/learn/${courseId}`);
      return;
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, status]);

  // 비디오 변경 시 lastSavedPosition 리셋
  useEffect(() => {
    setLastSavedPosition(0);
  }, [currentVideoIndex]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }

      const data = await response.json();

      // 수강 권한 확인
      if (!data.isEnrolled) {
        alert('이 강의를 수강할 권한이 없습니다.');
        router.push(`/courses/${courseId}`);
        return;
      }

      setCourse(data);

      // 진도 정보 불러오기
      await fetchProgress(courseId);
    } catch (error) {
      console.error('강의 로딩 실패:', error);
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  // 진도 정보 불러오기
  const fetchProgress = async (courseId: string) => {
    try {
      const response = await fetch(`/api/progress?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        const progressMap = new Map<string, Progress>();
        data.progresses?.forEach((p: any) => {
          progressMap.set(p.videoId, p);
        });
        setProgresses(progressMap);
      }
    } catch (error) {
      console.error('진도 조회 실패:', error);
    }
  };

  // 진도 저장 (5초마다 또는 비디오 완료 시)
  const saveProgress = async (videoId: string, position: number, isCompleted: boolean = false) => {
    try {
      // 이미 저장 중이면 스킵
      if (isSaving) {
        return;
      }

      // 5초 이상 차이나거나 완료 상태일 때만 저장
      if (Math.abs(position - lastSavedPosition) < 5 && !isCompleted) {
        return;
      }

      setIsSaving(true);

      console.log('Saving progress:', { videoId, position: Math.floor(position), isCompleted });

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          lastPosition: Math.floor(position),
          isCompleted,
        }),
      });

      console.log('Save response:', response.status);

      if (response.ok) {
        setLastSavedPosition(position);

        // 진도 정보 업데이트
        if (isCompleted) {
          const data = await response.json();
          if (data.progress) {
            setProgresses(prev => {
              const newMap = new Map(prev);
              newMap.set(videoId, data.progress);
              return newMap;
            });
          }
        }
      }
    } catch (error) {
      console.error('진도 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 비디오 시간 업데이트 핸들러
  const handleTimeUpdate = (data: { seconds: number; percent: number; duration: number }) => {
    if (!currentVideo) return;

    console.log('Time update:', data.seconds, 'seconds, progress:', Math.round(data.percent * 100) + '%');

    // 비디오가 90% 이상 재생되면 자동으로 완료 처리
    const isCompleted = data.percent >= 0.9;
    saveProgress(currentVideo.id, data.seconds, isCompleted);
  };

  // 비디오 종료 핸들러
  const handleVideoEnded = () => {
    if (!currentVideo) return;
    console.log('Video ended');
    saveProgress(currentVideo.id, currentVideo.duration, true);
  };

  const currentVideo = course?.videos[currentVideoIndex];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
    }
    return `${minutes}:00`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">강의를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  // 전체 진도율 계산
  const totalVideos = course?.videos.length || 0;
  const completedVideos = Array.from(progresses.values()).filter(p => p.isCompleted).length;
  const overallProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/courses/${courseId}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-white font-semibold text-lg line-clamp-1">
                {course.title}
              </h1>
              <p className="text-gray-400 text-sm">
                {course.instructorName}
              </p>
            </div>
          </div>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="text-sm text-gray-300 whitespace-nowrap">
            <span className="font-semibold text-white">{overallProgress}%</span>
            <span className="text-gray-400 ml-2">({completedVideos}/{totalVideos})</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Player */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Video Player */}
          <div className="flex-1 flex items-center justify-center p-4">
            {currentVideo && (
              <div className="w-full max-w-6xl">
                <DeviceVerifiedPlayer
                  key={currentVideo.id}
                  vimeoUrl={currentVideo.vimeoUrl}
                  controls={true}
                  responsive={true}
                  autoplay={false}
                  className="w-full aspect-video"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                />
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="bg-gray-800 p-6 border-t border-gray-700">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-white text-2xl font-bold mb-2">
                {currentVideo?.title}
              </h2>
              {currentVideo?.description && (
                <p className="text-gray-400 mb-4">
                  {currentVideo.description}
                </p>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
                  disabled={currentVideoIndex === 0}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← 이전 강의
                </button>
                <button
                  onClick={() => setCurrentVideoIndex(Math.min(course.videos.length - 1, currentVideoIndex + 1))}
                  disabled={currentVideoIndex === course.videos.length - 1}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  다음 강의 →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Video List */}
        <div
          className={`${
            showSidebar ? 'translate-x-0' : 'translate-x-full'
          } lg:translate-x-0 fixed lg:relative top-0 right-0 h-full w-full sm:w-96 bg-gray-800 border-l border-gray-700 transition-transform duration-300 z-50 lg:z-auto flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">강의 목록</h3>
              <p className="text-gray-400 text-sm">
                {course.videos.length}개 강의
              </p>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Video List */}
          <div className="flex-1 overflow-y-auto">
            {course.videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => {
                  setCurrentVideoIndex(index);
                  setShowSidebar(false);
                }}
                className={`w-full p-4 text-left border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                  currentVideoIndex === index ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                    currentVideoIndex === index
                      ? 'bg-primary text-white'
                      : progresses.get(video.id)?.isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {progresses.get(video.id)?.isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      video.order
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium mb-1 line-clamp-2 ${
                      currentVideoIndex === index ? 'text-white' : 'text-gray-300'
                    }`}>
                      {video.title}
                    </h4>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <span>{formatDuration(video.duration)}</span>
                      {progresses.get(video.id)?.isCompleted && (
                        <span className="text-green-400 text-xs">완료</span>
                      )}
                    </p>
                  </div>
                  {currentVideoIndex === index && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Course Files */}
          {course.files && course.files.length > 0 && (
            <div className="border-t border-gray-700 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                강의 자료
              </h3>
              <div className="space-y-2">
                {course.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.fileUrl}
                    download={file.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate group-hover:text-blue-400 transition-colors">{file.fileName}</p>
                      <p className="text-gray-400 text-xs">{formatFileSize(file.fileSize)}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
