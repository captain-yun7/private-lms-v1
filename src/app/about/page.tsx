import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '강사 소개',
  description: '선박조종연구소의 고급 선박조종이론 온라인 강의입니다.',
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
                  강사
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-3">
                  <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    선박조종연구소
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  선박조종연구소장
                </h1>
                <p className="text-xl text-blue-100 mb-4">
                  선박조종이론 전공
                </p>
                <p className="text-lg text-blue-50">
                  기존 선박조종이론과 최신 논문 연구 결과를 기반으로<br />
                  더욱 깊이 있는 지식을 제공합니다.
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
                  저의 교육 철학은 실제 해상에서 요구되는 실무 역량과 공학적 원리에 기반한 이론적 깊이를 균형 있게 갖춘 학습을 제공하는 데 있습니다.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  단순한 공식 암기나 사례 소개에 머무르지 않고, 선박이 왜 그렇게 움직이는지에 대한 근본적인 이해와 사고의 확장을 돕는 것을 목표로 합니다.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  이를 위해 전통적인 선박조종이론뿐 아니라 최신 연구 성과, 실선 사례, 시뮬레이션 분석 등을 체계적으로 연계하여 학습자가 현장에서 즉시 활용할 수 있는 실질적 지식을 전달하고자 합니다.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  또한 다양한 조종 상황을 공학적 관점에서 해석함으로써, 스스로 문제를 진단하고 합리적인 판단을 내릴 수 있는 심층적 사고 능력을 기를 수 있도록 돕는 것이 제 교육의 중요한 목표입니다. 이러한 철학을 바탕으로, 저는 학습자가 선박 전문가로 성장하기 위한 견고한 토대를 마련해 드리고자 합니다.
                </p>
              </div>
            </div>

            {/* Career & Research */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                경력 및 연구
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-100">
                <p className="text-lg text-gray-700 leading-relaxed">
                  선박조종이론 분야에서 박사학위를 취득한 후, 현재까지 지속적으로 관련 연구를 수행하고 있습니다.
                  특히 전 세계 상위 5% 이내의 국제 SCI 저널에 매년 여러 편의 연구 논문을 발표하며,
                  선박 조종·운동 해석 분야에서 학문적 기여를 이어가고 있습니다.
                </p>
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
              함께 선박조종이론을 배워보세요
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              체계적인 강의와 함께 선박조종 전문가로 성장하세요
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
