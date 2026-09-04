import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahleek.design";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mahleek Design | Premium Brand Identity and Web Design Portfolio",
    template: "%s | Mahleek Design",
  },
  description:
    "Mahleek Design creates premium brand identities, websites, and visual systems for ambitious businesses that want to look trusted, memorable, and ready for growth.",
  keywords: [
    "brand identity",
    "web design",
    "graphic design",
    "portfolio",
    "frontend development",
    "logo design",
    "Mahleek Design",
    "Lagos brand designer",
  ],
  authors: [{ name: "Mahleek Design" }],
  creator: "Mahleek Design",
  icons: {
    icon: "/images/favicon/branding-module-1.png",
    apple: "/images/favicon/branding-module-1.png",
  },
  openGraph: {
    title: "Mahleek Design | Premium Brand Identity and Web Design",
    description:
      "Cinematic portfolio of brand identity, web development, and visual design for growth-focused businesses.",
    type: "website",
    url: siteUrl,
    siteName: "Mahleek Design",
    locale: "en_NG",
    images: [
      {
        url: "/images/favicon/branding-module-1.png",
        width: 512,
        height: 512,
        alt: "Mahleek Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahleek Design | Premium Brand Identity and Web Design",
    description:
      "Premium brand identities, websites, and visual systems for ambitious businesses.",
    images: ["/images/favicon/branding-module-1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded">
          Skip to content
        </a>
        <div className="bg-overlay" aria-hidden="true" />
        <div className="bg-vignette" aria-hidden="true" />
        <div className="progress-rail" aria-hidden="true">
          <span id="scrollProgress" />
        </div>
        <Header />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
