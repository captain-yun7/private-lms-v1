import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 text-gray-300 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left - Brand & Business Info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">선박조종연구소</span>
            </Link>
            <div className="space-y-2 text-sm leading-relaxed">
              <p>사업자등록번호: 609-81-86463</p>
              <p>통신판매업신고번호: </p>
              <p>주식회사 코로아이 (대표: 서중교)</p>
              <p>사업장 소재지: 경상남도 창원시 성산구 연덕로15번길 83(웅남동)</p>
              <p>고객센터 전화번호: 055-266-8339</p>
              <p>이메일: shipedu@naver.com</p>
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
                  강사소개
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>Copyright &copy; {new Date().getFullYear()} 주식회사 코로아이. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-blue-300 transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-blue-300 transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/refund-policy" className="hover:text-blue-300 transition-colors">
                환불정책
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
