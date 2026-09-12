import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
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
    </>
  );
}