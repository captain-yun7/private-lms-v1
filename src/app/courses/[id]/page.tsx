'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VimeoPlayer from '@/components/VimeoPlayer';

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
  price: number;
  thumbnailUrl: string;
  instructorName: string;
  instructorIntro: string;
  isPublished: boolean;
  videos: Video[];
  files: CourseFile[];
  studentCount: number;
  videoCount: number;
  totalDuration: number;
  isEnrolled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProgressData {
  totalVideos: number;
  completedVideos: number;
  progressRate: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = params?.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${id}`);

      if (!response.ok) {
        setError(true);
        return;
      }

      const data = await response.json();
      setCourse(data);

      // 수강 등록된 경우 진도 정보 불러오기
      if (data.isEnrolled) {
        fetchProgress(id);
      }
    } catch (err) {
      console.error('강의 상세 정보 로딩 실패:', err);
      setError(true);
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
        setProgressData({
          totalVideos: data.totalVideos || 0,
          completedVideos: data.completedVideos || 0,
          progressRate: data.progressRate || 0,
        });
      }
    } catch (error) {
      console.error('진도 조회 실패:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}시간 ${minutes > 0 ? minutes + '분' : ''}`;
    }
    return `${minutes}분`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 수강 신청 버튼 클릭 핸들러
  const handleEnrollClick = () => {
    if (!session) {
      // 로그인하지 않은 경우 로그인 페이지로 리디렉션
      router.push(`/login?callbackUrl=/courses/${id}`);
    } else {
      // 로그인한 경우 결제 페이지로 이동
      router.push(`/checkout/${id}`);
    }
  };

  if (error) {
    notFound();
  }

  if (loading || !course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalHours = Math.floor(course.totalDuration / 3600);
  const totalMinutes = Math.floor((course.totalDuration % 3600) / 60);

  // 첫 번째 미리보기 가능한 영상 찾기
  const previewVideo = course.videos.find(video => video.isPreview);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-purple-700 text-white py-16 mt-[73px]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-200 mb-4">
                <Link href="/courses" className="hover:text-white">
                  강의
                </Link>
                <span>/</span>
                <span className="text-white">{course.title}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-100 mb-6">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{course.studentCount.toLocaleString()}명 수강</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{totalHours}시간 {totalMinutes}분</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{course.videoCount}개 강의</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  강사
                </div>
                <div>
                  <p className="text-sm text-gray-200">선박조종연구소</p>
                  <p className="font-semibold text-lg">선박조종연구소장</p>
                </div>
              </div>
            </div>

            {/* Preview Video/Thumbnail */}
            <div className="w-full">
              <div className="aspect-video rounded-xl shadow-2xl overflow-hidden bg-gray-900">
                {previewVideo ? (
                  <VimeoPlayer
                    vimeoUrl={previewVideo.vimeoUrl}
                    controls={true}
                    responsive={true}
                    className="w-full h-full"
                  />
                ) : (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {previewVideo && (
                <p className="text-sm text-gray-200 mt-3 text-center">
                  미리보기: {previewVideo.title}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 bg-bg-light py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Description */}
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">강의 소개</h2>
                <div className="text-text-primary whitespace-pre-line">
                  {course.description}
                </div>
              </div>

              {/* Curriculum */}
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  커리큘럼
                </h2>
                <div className="space-y-3">
                  {course.videos.map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">
                          {video.order}
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-sm text-text-secondary mt-1">
                              {video.description}
                            </p>
                          )}
                          {video.isPreview && (
                            <span className="text-xs text-primary font-medium">
                              미리보기 가능
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-text-secondary">
                          {formatDuration(video.duration)}
                        </span>
                        {video.isPreview && (
                          <button
                            onClick={() => setSelectedVideo(video)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            title="미리보기 재생"
                          >
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                  <span className="text-text-secondary">총 {course.videoCount}개 강의</span>
                  <span className="font-semibold text-text-primary">
                    {totalHours}시간 {totalMinutes}분
                  </span>
                </div>
              </div>

              {/* Course Files */}
              {course.files && course.files.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">
                    강의 자료
                  </h2>
                  <div className="space-y-3">
                    {course.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <h3 className="font-medium text-text-primary">
                              {file.fileName}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </div>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                        >
                          다운로드
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-card p-8 border-2 border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">강사 소개</h2>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                    강사
                  </div>
                  <div>
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-2">
                        선박조종연구소
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      강사: 선박조종연구소장
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {course.instructorIntro}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Purchase Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-primary">
                      ₩{course.price.toLocaleString()}
                    </span>
                    <span className="text-base text-text-secondary">(VAT 포함)</span>
                  </div>
                </div>

                {course.isEnrolled ? (
                  <>
                    {progressData && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-text-primary">학습 진도</span>
                          <span className="text-sm font-semibold text-primary">{progressData.progressRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressData.progressRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          {progressData.completedVideos} / {progressData.totalVideos} 강의 완료
                        </p>
                      </div>
                    )}
                    <Link href={`/learn/${course.id}`} className="btn-primary w-full block text-center">
                      {progressData && progressData.progressRate > 0 ? '학습 계속하기' : '학습 시작하기'}
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleEnrollClick}
                    className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 mb-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    수강 신청하기
                  </button>
                )}

                <Link
                  href="/courses"
                  className="btn-secondary w-full block text-center"
                >
                  다른 강의 둘러보기
                </Link>

                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-text-primary">수강기간: 6개월</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-text-primary">모든 기기에서 시청</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-text-primary">강의 자료 다운로드</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-text-primary">1:1 질문 답변</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-text-secondary text-center">
                    수강 전 <Link href="/terms" className="text-primary hover:underline">이용약관</Link> 및{' '}
                    <Link href="/privacy" className="text-primary hover:underline">개인정보처리방침</Link>을 확인하세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Video Preview Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {selectedVideo.title}
                </h3>
                {selectedVideo.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-gray-900">
              <VimeoPlayer
                vimeoUrl={selectedVideo.vimeoUrl}
                controls={true}
                responsive={true}
                autoplay={true}
                className="w-full h-full"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-bg-secondary flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                <span className="font-medium text-primary">미리보기</span> - 이 영상은 무료로 시청할 수 있습니다
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
