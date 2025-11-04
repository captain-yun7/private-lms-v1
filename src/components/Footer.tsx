import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 text-gray-300 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left - Brand & Info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">김대정 교수</span>
              <span className="text-sm text-blue-300">한국해양대학교</span>
            </Link>
            <div className="space-y-2 text-sm leading-relaxed">
              <p className="text-blue-200">해양공학 온라인 강의</p>
              <p>한국해양대학교 해양공학과</p>
              <p>부산광역시 영도구 태종로 727</p>
              <p className="mt-4 text-gray-400">강의 및 기술 문의를 환영합니다</p>
            </div>
          </div>

          {/* Right - Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">메뉴</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/courses" className="hover:text-blue-300 transition-colors">
                  강의
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-300 transition-colors">
                  교수 소개
                </Link>
              </li>
              <li>
                <Link href="/notices" className="hover:text-blue-300 transition-colors">
                  공지사항
                </Link>
              </li>
              <li>
                <Link href="/inquiries/new" className="hover:text-blue-300 transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} 한국해양대학교 김대정 교수. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
