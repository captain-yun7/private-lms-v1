import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | Private LMS',
    default: 'Private LMS - 온라인 강의 플랫폼'
  },
  description: "전문가와 함께하는 온라인 강의. 언제 어디서나 최고의 강의를 들을 수 있습니다.",
  keywords: ["온라인 강의", "이러닝", "LMS", "교육", "강의", "학습"],
  authors: [{ name: "Private LMS" }],
  creator: "Private LMS",
  publisher: "Private LMS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Private LMS - 온라인 강의 플랫폼',
    description: '전문가와 함께하는 온라인 강의. 언제 어디서나 최고의 강의를 들을 수 있습니다.',
    url: '/',
    siteName: 'Private LMS',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Private LMS - 온라인 강의 플랫폼',
    description: '전문가와 함께하는 온라인 강의. 언제 어디서나 최고의 강의를 들을 수 있습니다.',
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
