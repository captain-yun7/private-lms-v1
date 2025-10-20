import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section - LiveKlass Style */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-[56px] leading-[1.2] font-bold text-black mb-6">
              전문 강사와 함께하는<br />
              온라인 강의 플랫폼
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              체계적인 커리큘럼으로 필요한 것을 가장 잘 아는 솔루션<br />
              영상 강의, 학습 자료, 진도 관리까지 한번에 제공합니다
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-base font-medium text-black border-b-2 border-black pb-1 hover:gap-3 transition-all"
            >
              더 알아보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Card Style */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white p-12 rounded-2xl hover:shadow-lg transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-black rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">영상 강의 플랫폼</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  고화질 영상 강의를 언제 어디서나 수강하세요. 필요한 부분은 반복 재생하며 학습할 수 있습니다.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Vimeo 기반 고화질 스트리밍</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>PC, 태블릿, 모바일 모두 지원</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>이어보기 및 진도율 자동 저장</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white p-12 rounded-2xl hover:shadow-lg transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-black rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">학습 관리 시스템</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  내 학습 진행 상황을 한눈에 확인하고 체계적으로 관리할 수 있습니다.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>실시간 진도율 추적</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>강의별 완료 현황 확인</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>학습 통계 및 리포트</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white p-12 rounded-2xl hover:shadow-lg transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-black rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">강의 자료 제공</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  강의와 함께 제공되는 다양한 학습 자료를 다운로드하여 활용하세요.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>PDF 강의 노트</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>실습 예제 파일</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>보충 학습 자료</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white p-12 rounded-2xl hover:shadow-lg transition-all">
              <div className="mb-6">
                <div className="w-14 h-14 bg-black rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">1:1 질문 답변</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  강의 중 궁금한 점은 언제든지 강사에게 직접 질문하세요.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>빠른 답변 제공</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>비공개 문의 가능</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-black mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>질문 내역 관리</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
