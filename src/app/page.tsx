import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section - Ship Maneuvering Theme */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                선박조종연구소
              </span>
            </div>
            <h1 className="text-[56px] leading-[1.2] font-bold text-gray-900 mb-6">
              고급 선박조종이론<br />
              온라인 강의
            </h1>
            <p className="text-xl text-gray-700 mb-12 leading-relaxed">
              선박조종 전문가 양성을 위한 체계적인 교육<br />
              이론과 실무를 겸비한 깊이 있는 선박조종이론을 제공합니다
            </p>
            <div className="flex gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all hover:gap-3"
              >
                강의 둘러보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Ship Maneuvering Theme */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">강의 특징</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-12 rounded-2xl hover:shadow-lg transition-all border-2 border-blue-100">
              <div className="mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">선박조종 전문 강의</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  기존 선박조종이론과 최신 논문 연구 결과를 기반으로 더욱 깊이 있는 지식을 제공합니다.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>이론과 실무를 아우르는 강의</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>PC, 태블릿, 모바일 모두 지원</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>이어보기 및 진도율 자동 저장</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-12 rounded-2xl hover:shadow-lg transition-all border-2 border-sky-100">
              <div className="mb-6">
                <div className="w-14 h-14 bg-sky-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">체계적인 진도 관리</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  학습 진행 상황을 한눈에 확인하고 목표를 향해 꾸준히 나아가세요.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-sky-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>실시간 진도율 추적</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-sky-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>강의별 완료 현황 확인</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-sky-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>학습 통계 및 리포트</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-12 rounded-2xl hover:shadow-lg transition-all border-2 border-cyan-100">
              <div className="mb-6">
                <div className="w-14 h-14 bg-cyan-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">풍부한 학습 자료</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  선박조종 분야의 핵심 자료와 실습 예제를 제공합니다.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-cyan-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>강의 노트 및 요약 자료</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-cyan-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>실무 예제 및 케이스 스터디</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-cyan-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>참고 문헌 및 추가 자료</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-12 rounded-2xl hover:shadow-lg transition-all border-2 border-blue-100">
              <div className="mb-6">
                <div className="w-14 h-14 bg-blue-700 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1:1 학습 멘토링</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  강의 중 궁금한 점은 언제든지 강사님께 직접 질문하세요.
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>강사님의 직접 답변</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>비공개 문의 가능</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
