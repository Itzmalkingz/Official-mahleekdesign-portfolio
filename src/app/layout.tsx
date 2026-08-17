import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Mahleek Design | Premium Brand Identity and Web Design Portfolio",
  description:
    "Mahleek Design creates premium brand identities, websites, and visual systems for ambitious businesses that want to look trusted, memorable, and ready for growth.",
  keywords: [
    "brand identity",
    "web design",
    "graphic design",
    "portfolio",
    "frontend development",
    "logo design",
  ],
  openGraph: {
    title: "Mahleek Design | Premium Brand Identity and Web Design",
    description:
      "Cinematic portfolio of brand identity, web development, and visual design for growth-focused businesses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="bg-overlay" aria-hidden="true" />
        <div className="bg-vignette" aria-hidden="true" />
        <div className="progress-rail" aria-hidden="true">
          <span id="scrollProgress" />
        </div>
        <Header />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
