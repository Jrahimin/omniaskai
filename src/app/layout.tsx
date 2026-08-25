import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
});

export const metadata: Metadata = {
  title: {
    default: "OmniAskAI",
    template: "%s · OmniAskAI",
  },
  description:
    "Curated knowledge worlds with trusted sources, grounded answers, and citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoSansBengali.variable} antialiased`}>
        <a href="#main" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
