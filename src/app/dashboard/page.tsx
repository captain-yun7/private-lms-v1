import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '대시보드',
  description: '내 강의 및 학습 현황을 확인하세요.',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // 수강 중인 강의 목록 가져오기
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      course: {
        include: {
          videos: {
            select: {
              id: true,
              duration: true,
            },
          },
          _count: {
            select: {
              videos: true,
            },
          },
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  });

  // 각 강의의 진도 정보 가져오기
  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const videoIds = enrollment.course.videos.map((v) => v.id);

      const progresses = await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          videoId: { in: videoIds },
        },
      });

      const totalVideos = enrollment.course._count.videos;
      const completedVideos = progresses.filter((p) => p.isCompleted).length;
      const progressRate = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      const totalDuration = enrollment.course.videos.reduce((sum, v) => sum + (v.duration || 0), 0);

      return {
        ...enrollment.course,
        enrolledAt: enrollment.enrolledAt,
        totalVideos,
        completedVideos,
        progressRate,
        totalDuration,
      };
    })
  );

  // 통계 계산
  const totalEnrolled = enrollments.length;
  const totalCompleted = coursesWithProgress.filter((c) => c.progressRate === 100).length;
  const totalLearningTime = coursesWithProgress.reduce((sum, c) => {
    // 진도율에 따른 학습 시간 계산
    return sum + (c.totalDuration * c.progressRate / 100);
  }, 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}시간 ${minutes > 0 ? minutes + '분' : ''}`;
    }
    return `${minutes}분`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Header />

      <main className="flex-1 py-12 mt-[73px]">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || '사용자'}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                  {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  환영합니다, {session.user.name || '사용자'}님!
                </h1>
                <p className="text-text-secondary mt-1">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-secondary">수강 중인 강의</h3>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-text-primary">{totalEnrolled}</p>
              <p className="text-sm text-text-secondary mt-2">
                {totalEnrolled > 0 ? '열심히 학습 중입니다!' : '강의를 구매하고 학습을 시작하세요'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-secondary">완료한 강의</h3>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-text-primary">{totalCompleted}</p>
              <p className="text-sm text-text-secondary mt-2">
                {totalCompleted > 0 ? '축하합니다!' : '완료된 강의가 없습니다'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-secondary">학습 시간</h3>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-text-primary">
                {Math.floor(totalLearningTime / 3600)}
                <span className="text-2xl text-text-secondary ml-1">시간</span>
              </p>
              <p className="text-sm text-text-secondary mt-2">총 학습 시간</p>
            </div>
          </div>

          {/* My Courses Section */}
          <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">내 강의</h2>
              <a href="/courses" className="text-primary hover:text-primary-dark font-medium flex items-center gap-2">
                강의 둘러보기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {coursesWithProgress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesWithProgress.map((course) => (
                  <Link
                    key={course.id}
                    href={`/learn/${course.id}`}
                    className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {course.thumbnailUrl && (
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-text-secondary mb-4">
                        {course.instructorName}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-text-secondary">진도율</span>
                          <span className="text-xs font-semibold text-primary">{course.progressRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-300"
                            style={{ width: `${course.progressRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          {course.completedVideos} / {course.totalVideos} 강의 완료
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">
                          {formatDuration(course.totalDuration)}
                        </span>
                        <span className="text-primary font-medium">
                          학습 계속하기 →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">수강 중인 강의가 없습니다</h3>
                <p className="text-text-secondary mb-6">관심 있는 강의를 둘러보고 학습을 시작해보세요!</p>
                <a
                  href="/courses"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  강의 찾아보기
                </a>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-card p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">최근 학습 활동</h2>

            <div className="text-center py-12">
              <div className="w-16 h-16 bg-bg-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-text-secondary">최근 학습 활동이 없습니다</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
