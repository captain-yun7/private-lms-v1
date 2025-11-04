import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | 김대정 교수',
    default: '김대정 교수 - 한국해양대학교 해양공학 온라인 강의'
  },
  description: "한국해양대학교 김대정 교수의 해양공학 온라인 강의. 선박 설계, 해양 구조물, 유체역학 등 체계적인 해양공학 교육을 제공합니다.",
  keywords: ["해양공학", "선박공학", "한국해양대학교", "김대정", "해양 구조물", "선박 설계", "유체역학", "온라인 강의", "해양 에너지"],
  authors: [{ name: "김대정" }],
  creator: "김대정",
  publisher: "한국해양대학교",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: '김대정 교수 - 한국해양대학교 해양공학 온라인 강의',
    description: '한국해양대학교 김대정 교수의 해양공학 온라인 강의. 선박 설계, 해양 구조물, 유체역학 등 체계적인 해양공학 교육을 제공합니다.',
    url: '/',
    siteName: '김대정 교수 해양공학 강의',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '김대정 교수 - 한국해양대학교 해양공학 온라인 강의',
    description: '한국해양대학교 김대정 교수의 해양공학 온라인 강의. 선박 설계, 해양 구조물, 유체역학 등 체계적인 해양공학 교육을 제공합니다.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
