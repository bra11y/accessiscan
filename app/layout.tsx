import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";

const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AccessiScan — Accessibility Auditing Dashboard",
  description:
    "Automated + human-powered accessibility testing. WCAG 2.1, ADA, Section 508, and ARIA compliance scanning with real expert review.",
  keywords: [
    "accessibility",
    "WCAG",
    "ADA compliance",
    "web accessibility testing",
    "Section 508",
    "ARIA",
    "a11y",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontBody.variable} ${fontMono.variable} ${fontDisplay.variable}`}
    >
      <body className="font-sans antialiased bg-surface text-slate-200">
        {/* Skip to main content — Accessibility Pyramid: Foundation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          Skip to main content
        </a>

        {children}
      </body>
    </html>
  );
}
