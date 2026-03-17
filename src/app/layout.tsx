import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "부고장 | 온라인 모바일 부고",
  description:
    "소중한 분의 마지막 길을 정중하게 알려드립니다. 모바일 부고장을 쉽고 빠르게 만들어보세요.",
  openGraph: {
    title: "부고장 | 온라인 모바일 부고",
    description: "소중한 분의 마지막 길을 정중하게 알려드립니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />
      </head>
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
