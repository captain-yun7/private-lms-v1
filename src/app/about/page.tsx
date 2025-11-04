import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '교수 소개',
  description: '한국해양대학교 김대정 교수의 해양공학 온라인 강의입니다.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white py-20 md:py-28 mt-[73px]">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-6xl font-bold shadow-2xl">
                  김
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-3">
                  <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    한국해양대학교
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  김대정 교수
                </h1>
                <p className="text-xl text-blue-100 mb-4">
                  해양공학 전공
                </p>
                <p className="text-lg text-blue-50">
                  해양 산업의 미래를 이끌 전문가 양성을 위해<br />
                  체계적이고 실무 중심의 교육을 제공합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Education Philosophy */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                교육 철학
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 md:p-12 border-2 border-blue-100">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  해양공학은 단순한 이론 학습을 넘어, 실제 해양 산업 현장에서 직면하는 문제를 해결할 수 있는 실무 능력을 요구합니다.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  저는 학생들이 이론적 기초를 탄탄히 다지면서도, 실무 사례와 최신 기술 동향을 함께 학습할 수 있도록 강의를 구성합니다.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  한국해양대학교에서의 오랜 교육 경험과 연구 성과를 바탕으로, 해양 산업의 미래를 이끌어갈 인재를 양성하는 것이 저의 목표입니다.
                </p>
              </div>
            </div>

            {/* Expertise Areas */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                전문 분야
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Area 1 */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">선박 설계 및 구조</h3>
                  <p className="text-gray-600">
                    선박 구조 해석, 최적 설계, 강도 평가 등 선박공학의 핵심 분야
                  </p>
                </div>

                {/* Area 2 */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-cyan-100 hover:border-cyan-300 transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">해양 구조물</h3>
                  <p className="text-gray-600">
                    해양 플랫폼, 부유식 구조물 등 해양 구조물의 설계 및 안전성 평가
                  </p>
                </div>

                {/* Area 3 */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-sky-100 hover:border-sky-300 transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-sky-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">해양 에너지</h3>
                  <p className="text-gray-600">
                    해상풍력, 조류 발전 등 신재생 해양 에너지 시스템
                  </p>
                </div>

                {/* Area 4 */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-700 to-cyan-700 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">유체역학 및 동역학</h3>
                  <p className="text-gray-600">
                    선박 및 해양 구조물의 유체역학적 성능 해석 및 최적화
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              함께 해양공학을 배워보세요
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              체계적인 강의와 함께 해양 산업의 전문가로 성장하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                강의 둘러보기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/inquiries/new"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-blue-400 transition-all shadow-md hover:shadow-lg"
              >
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
