'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-black">
            Private LMS
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-14">
            <li>
              <Link href="/courses" className="text-base text-gray-700 hover:text-black transition-colors font-medium">
                강의
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-base text-gray-700 hover:text-black transition-colors font-medium">
                소개
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-base text-gray-700 hover:text-black transition-colors font-medium">
                문의
              </Link>
            </li>
          </ul>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary rounded-lg transition-colors"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || '사용자'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                    </div>
                  )}
                  <span className="font-medium text-text-primary">{session.user.name || '사용자'}</span>
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-1 animate-fade-in">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-text-primary hover:bg-bg-secondary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      마이페이지
                    </Link>
                    <Link
                      href="/mypage/payments"
                      className="block px-4 py-2 text-text-primary hover:bg-bg-secondary transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      결제 내역
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-secondary transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-gray-700 hover:text-black transition-colors font-medium"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 bg-black text-white rounded-md hover:bg-gray-900 transition-all font-medium"
                >
                  시작하기
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-primary"
            aria-label="메뉴"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/courses"
                  className="block px-4 py-2 text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  강의
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block px-4 py-2 text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block px-4 py-2 text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  문의
                </Link>
              </li>

              {session ? (
                <>
                  <li className="pt-3 border-t border-border">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-text-primary bg-bg-secondary rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      마이페이지
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/mypage/payments"
                      className="block px-4 py-2 text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      결제 내역
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                      로그아웃
                    </button>
                  </li>
                </>
              ) : (
                <li className="pt-3 border-t border-border flex gap-3">
                  <Link
                    href="/login"
                    className="flex-1 text-center px-4 py-2 text-text-primary bg-bg-secondary rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 text-center px-4 py-2 bg-primary text-white rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    시작하기
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
