import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";

import { getRequestLocale } from "@/lib/locale/get-request-locale";
import { localeChrome } from "@/lib/locale/locale";

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
  icons: {
    icon: "/brand/omniaskai-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const chrome = localeChrome[locale];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSansBengali.variable} antialiased`}
        suppressHydrationWarning
      >
        <a href="#main" className="skip-to-content">
          {chrome.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
