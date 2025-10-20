import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '강의 상세',
  description: '강의의 자세한 정보를 확인하고 수강하세요.',
};

// TODO: Phase 2에서 실제 데이터베이스에서 데이터를 가져올 예정
const coursesData = [
  {
    id: '1',
    title: '웹 개발 완벽 가이드',
    description: 'HTML, CSS, JavaScript부터 React까지 모던 웹 개발의 모든 것을 배워보세요. 실무에 바로 적용할 수 있는 프로젝트 중심의 강의입니다.',
    fullDescription: `이 강의는 웹 개발의 기초부터 심화까지 모든 것을 다룹니다.

### 강의 내용
- HTML5 기본 문법과 시맨틱 태그
- CSS3 레이아웃과 Flexbox, Grid
- JavaScript ES6+ 문법
- React 기초부터 고급 패턴까지
- 실전 프로젝트: 포트폴리오 웹사이트 제작

### 수강 대상
- 웹 개발을 처음 시작하는 분
- 프론트엔드 개발자로 취업을 준비하는 분
- 기존 개발자 중 최신 기술을 배우고 싶은 분

### 선수 지식
- 컴퓨터 기본 사용법
- 영어 읽기 (기술 문서 이해를 위해)`,
    price: 99000,
    thumbnailGradient: 'from-blue-500 to-purple-600',
    category: '개발',
    duration: '12시간',
    rating: 4.8,
    reviewCount: 234,
    studentCount: 1234,
    instructor: '김개발',
    instructorIntro: '10년차 프론트엔드 개발자이며, 네이버, 카카오 등에서 근무한 경력이 있습니다.',
    videos: [
      { id: 1, title: '강의 소개 및 개발 환경 설정', duration: 720, isPreview: true },
      { id: 2, title: 'HTML 기초', duration: 1800, isPreview: true },
      { id: 3, title: 'CSS 기초와 선택자', duration: 2400, isPreview: false },
      { id: 4, title: 'Flexbox 완벽 정복', duration: 1920, isPreview: false },
      { id: 5, title: 'JavaScript 기본 문법', duration: 2700, isPreview: false },
      { id: 6, title: 'React 시작하기', duration: 1680, isPreview: false },
    ],
  },
  {
    id: '2',
    title: 'UI/UX 디자인 기초',
    description: '사용자 중심의 인터페이스 디자인 원칙과 실전 프로젝트',
    fullDescription: 'UI/UX 디자인의 기초를 배우고 실전 프로젝트를 진행합니다.',
    price: 79000,
    thumbnailGradient: 'from-pink-500 to-red-600',
    category: '디자인',
    duration: '8시간',
    rating: 4.9,
    reviewCount: 189,
    studentCount: 789,
    instructor: '이디자인',
    instructorIntro: 'Google, Apple에서 UX 디자이너로 근무했습니다.',
    videos: [
      { id: 1, title: '디자인 기초 이론', duration: 1200, isPreview: true },
      { id: 2, title: '색상 이론', duration: 1500, isPreview: false },
    ],
  },
];

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = coursesData.find((c) => c.id === id);

  if (!course) {
    notFound();
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  const totalDuration = course.videos.reduce((sum, video) => sum + video.duration, 0);
  const totalHours = Math.floor(totalDuration / 3600);
  const totalMinutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-purple-700 text-white py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-200 mb-4">
                <Link href="/courses" className="hover:text-white">
                  강의
                </Link>
                <span>/</span>
                <span className="text-white">{course.title}</span>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {course.category}
                </span>
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
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-200">({course.reviewCount}개 평가)</span>
                </div>

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
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {course.instructor[0]}
                </div>
                <div>
                  <p className="text-sm text-gray-200">강사</p>
                  <p className="font-semibold text-lg">{course.instructor}</p>
                </div>
              </div>
            </div>

            {/* Preview Video Placeholder */}
            <div className="lg:block">
              <div className={`aspect-video bg-gradient-to-br ${course.thumbnailGradient} rounded-xl shadow-2xl flex items-center justify-center`}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-white text-lg font-semibold">미리보기 영상</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 bg-bg-light py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Description */}
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">강의 소개</h2>
                <div className="prose prose-lg max-w-none">
                  <div className="text-text-primary whitespace-pre-line">
                    {course.fullDescription}
                  </div>
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
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">
                            {video.title}
                          </h3>
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
                          <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
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
                  <span className="text-text-secondary">총 {course.videos.length}개 강의</span>
                  <span className="font-semibold text-text-primary">
                    {totalHours}시간 {totalMinutes}분
                  </span>
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">강사 소개</h2>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                    {course.instructor[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      {course.instructor}
                    </h3>
                    <p className="text-text-secondary">
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
                  </div>
                  <p className="text-sm text-text-secondary">평생 수강 가능</p>
                </div>

                <button className="btn-primary w-full mb-3">
                  수강 신청하기
                </button>

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
                    <span className="text-text-primary">평생 수강 가능</span>
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
    </div>
  );
}
