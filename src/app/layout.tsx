import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mahleekdesign.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mahleek Design | Memorable Brands. Purposeful Web Systems.",
    template: "%s | Mahleek Design",
  },
  description:
    "Mahleek Design creates memorable brand identities and purposeful web systems for businesses ready to stand out and work smarter.",
  keywords: [
    "brand identity",
    "web systems",
    "web development",
    "custom web applications",
    "design studio",
    "brand design",
    "Mahleek Design",
  ],
  authors: [{ name: "Mahleek Design" }],
  creator: "Mahleek Design",
  icons: {
    icon: "/images/favicon/branding-module-1.png",
    apple: "/images/favicon/branding-module-1.png",
  },
  openGraph: {
    title: "Mahleek Design | Memorable Brands. Purposeful Web Systems.",
    description: "A creative technology studio building memorable brand identities and purposeful web systems.",
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
    title: "Mahleek Design | Memorable Brands. Purposeful Web Systems.",
    description: "A creative technology studio building memorable brand identities and purposeful web systems.",
    images: ["/images/favicon/branding-module-1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: siteUrl },
  verification: {
    google: 'RZAw-j4-At73OOyKR1NZPTiUlXn_lVeggTatJ-3-nto',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}