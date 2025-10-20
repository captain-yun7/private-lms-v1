import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#2B2D36] text-gray-400 py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Left - Brand & Info */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <span className="text-xl font-bold text-white">Private LMS</span>
            </Link>
            <div className="space-y-2 text-sm leading-relaxed">
              <p>(주)프라이빗LMS · 대표이사 : 홍길동 · 개인정보보호책임자 : 김철수</p>
              <p>사업자등록번호 : 123-45-67890</p>
              <p>통신판매업 신고번호 : 제2019-서울강남-01234호</p>
              <p>주소 : 서울특별시 강남구 테헤란로 123, 456호</p>
              <p>서비스 및 기술 문의: support@privatelms.com</p>
              <p>이메일: contact@privatelms.com</p>
            </div>
          </div>

          {/* Right - Links Grid */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Column 1 */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">주요 기능</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/courses" className="hover:text-white transition-colors">
                      강의
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">
                      소개
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white transition-colors">
                      문의
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2 */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">서비스</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/faq" className="hover:text-white transition-colors">
                      프로그램
                    </Link>
                  </li>
                  <li>
                    <Link href="/notice" className="hover:text-white transition-colors">
                      인재영입
                    </Link>
                  </li>
                  <li>
                    <Link href="/inquiry" className="hover:text-white transition-colors">
                      운영 서비스
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">스토리</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/blog" className="hover:text-white transition-colors">
                      고객센터
                    </Link>
                  </li>
                  <li>
                    <Link href="/community" className="hover:text-white transition-colors">
                      블로그
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="hover:text-white transition-colors">
                      이벤트
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Additional Links Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-10">
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">커뮤니티</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/support" className="hover:text-white transition-colors">
                      영상 서비스
                    </Link>
                  </li>
                  <li>
                    <Link href="/guide" className="hover:text-white transition-colors">
                      이카운트
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">
                      세무기장
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">고객지원</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      블로그
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      운영 가이드
                    </Link>
                  </li>
                  <li>
                    <Link href="/refund" className="hover:text-white transition-colors">
                      문의하기
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">커뮤니티</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      블로그
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      고객지원
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/company" className="hover:text-white transition-colors">
              회사소개
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              서비스이용약관
            </Link>
          </div>

          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              aria-label="Naver Blog"
            >
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Build Your Class</p>
          <p className="mt-1">Made by ❤ FutureSchole Inc.</p>
        </div>
      </div>
    </footer>
  );
}
