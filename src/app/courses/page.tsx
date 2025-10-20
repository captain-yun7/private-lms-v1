import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '강의 목록',
  description: '다양한 온라인 강의를 둘러보고 수강하세요.',
};

export default function CoursesPage() {
  // TODO: Phase 2에서 실제 데이터베이스에서 강의 목록을 가져올 예정
  const courses = [
    {
      id: 1,
      title: '웹 개발 완벽 가이드',
      description: 'HTML, CSS, JavaScript부터 React까지 모던 웹 개발의 모든 것',
      price: 99000,
      thumbnailGradient: 'from-blue-500 to-purple-600',
      category: '개발',
      duration: '12시간',
      rating: 4.8,
      reviewCount: 234,
      instructor: '김개발',
    },
    {
      id: 2,
      title: 'UI/UX 디자인 기초',
      description: '사용자 중심의 인터페이스 디자인 원칙과 실전 프로젝트',
      price: 79000,
      thumbnailGradient: 'from-pink-500 to-red-600',
      category: '디자인',
      duration: '8시간',
      rating: 4.9,
      reviewCount: 189,
      instructor: '이디자인',
    },
    {
      id: 3,
      title: '디지털 마케팅 전략',
      description: 'SNS, 콘텐츠, SEO까지 효과적인 온라인 마케팅 기법',
      price: 89000,
      thumbnailGradient: 'from-green-500 to-teal-600',
      category: '마케팅',
      duration: '10시간',
      rating: 4.7,
      reviewCount: 156,
      instructor: '박마케터',
    },
    {
      id: 4,
      title: 'Python 데이터 분석',
      description: 'Pandas, NumPy부터 데이터 시각화까지',
      price: 109000,
      thumbnailGradient: 'from-yellow-500 to-orange-600',
      category: '데이터',
      duration: '15시간',
      rating: 4.9,
      reviewCount: 312,
      instructor: '최데이터',
    },
    {
      id: 5,
      title: 'React Native 모바일 앱 개발',
      description: 'iOS와 Android 앱을 동시에 개발하는 크로스 플랫폼 기술',
      price: 129000,
      thumbnailGradient: 'from-cyan-500 to-blue-600',
      category: '개발',
      duration: '18시간',
      rating: 4.8,
      reviewCount: 267,
      instructor: '정모바일',
    },
    {
      id: 6,
      title: 'Adobe Photoshop 마스터클래스',
      description: '초보자부터 전문가까지, 포토샵의 모든 것',
      price: 69000,
      thumbnailGradient: 'from-purple-500 to-indigo-600',
      category: '디자인',
      duration: '14시간',
      rating: 4.7,
      reviewCount: 198,
      instructor: '강포토샵',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-purple-700 text-white py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              나에게 맞는 강의를 찾아보세요
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8">
              전문가와 함께하는 고품질 온라인 강의
            </p>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="강의 검색..."
                className="w-full px-6 py-4 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-border sticky top-[73px] z-40">
        <div className="container">
          <div className="flex items-center gap-4 py-4 overflow-x-auto">
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium whitespace-nowrap">
              전체
            </button>
            <button className="px-4 py-2 bg-bg-secondary text-text-primary hover:bg-gray-200 rounded-lg font-medium whitespace-nowrap transition-colors">
              개발
            </button>
            <button className="px-4 py-2 bg-bg-secondary text-text-primary hover:bg-gray-200 rounded-lg font-medium whitespace-nowrap transition-colors">
              디자인
            </button>
            <button className="px-4 py-2 bg-bg-secondary text-text-primary hover:bg-gray-200 rounded-lg font-medium whitespace-nowrap transition-colors">
              마케팅
            </button>
            <button className="px-4 py-2 bg-bg-secondary text-text-primary hover:bg-gray-200 rounded-lg font-medium whitespace-nowrap transition-colors">
              데이터
            </button>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <main className="flex-1 bg-bg-light py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                전체 강의 ({courses.length})
              </h2>
              <p className="text-text-secondary">
                다양한 분야의 전문 강의를 만나보세요
              </p>
            </div>

            {/* Sort Options */}
            <select className="px-4 py-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option>인기순</option>
              <option>최신순</option>
              <option>가격 낮은순</option>
              <option>가격 높은순</option>
              <option>평점순</option>
            </select>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="card-hover group"
              >
                {/* Thumbnail */}
                <div className={`relative aspect-video bg-gradient-to-br ${course.thumbnailGradient} rounded-lg mb-4 overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-text-primary rounded-full text-xs font-semibold">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  {/* Instructor & Duration */}
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{course.instructor}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary text-sm line-clamp-2">
                    {course.description}
                  </p>

                  {/* Price & Rating */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-primary">
                      ₩{course.price.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="font-medium text-text-primary">{course.rating}</span>
                      <span>({course.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State (when no courses) */}
          {courses.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                강의가 없습니다
              </h3>
              <p className="text-text-secondary">
                곧 다양한 강의가 추가될 예정입니다
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
