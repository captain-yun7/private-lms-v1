import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | 선박조종연구소',
    default: '선박조종연구소 - 고급 선박조종이론 온라인 강의'
  },
  description: "선박조종연구소의 고급 선박조종이론 온라인 강의. 선박조종 전문가 양성을 위한 체계적인 교육을 제공합니다.",
  keywords: ["선박조종", "선박조종이론", "선박조종연구소", "선박 조종", "해기사", "온라인 강의", "선박 교육"],
  authors: [{ name: "선박조종연구소" }],
  creator: "선박조종연구소",
  publisher: "선박조종연구소",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: '선박조종연구소 - 고급 선박조종이론 온라인 강의',
    description: '선박조종연구소의 고급 선박조종이론 온라인 강의. 선박조종 전문가 양성을 위한 체계적인 교육을 제공합니다.',
    url: '/',
    siteName: '선박조종연구소',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '선박조종연구소 - 고급 선박조종이론 온라인 강의',
    description: '선박조종연구소의 고급 선박조종이론 온라인 강의. 선박조종 전문가 양성을 위한 체계적인 교육을 제공합니다.',
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
