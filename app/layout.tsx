import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nevashop.tr"),

  title: {
    default: "Neva Shop | Saten Buket ve Hediyelik Ürünler",
    template: "%s | Neva Shop",
  },

  description:
    "Neva Shop ile saten buket, özel gün hediyeleri ve zarif hediyelik ürünleri inceleyin. Beğendiğiniz ürünü WhatsApp üzerinden hızlıca sipariş verin.",

  keywords: [
    "Neva Shop",
    "nevashop",
    "saten buket",
    "saten çiçek",
    "hediyelik ürünler",
    "özel gün hediyesi",
    "sevgiliye hediye",
    "anneler günü hediyesi",
    "doğum günü hediyesi",
    "WhatsApp sipariş",
    "online hediye mağazası",
  ],

  authors: [{ name: "Neva Shop" }],
  creator: "Neva Shop",
  publisher: "Neva Shop",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://nevashop.tr",
    siteName: "Neva Shop",
    title: "Neva Shop | Saten Buket ve Hediyelik Ürünler",
    description:
      "Saten buket ve zarif hediyelik ürünleri inceleyin, beğendiğiniz ürünü WhatsApp üzerinden kolayca sipariş verin.",
    images: [
      {
        url: "/neva-logo.png",
        width: 1200,
        height: 630,
        alt: "Neva Shop",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Neva Shop | Saten Buket ve Hediyelik Ürünler",
    description:
      "Saten buket ve özel gün hediyeliklerini Neva Shop’ta inceleyin.",
    images: ["/neva-logo.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/neva-logo.png",
    shortcut: "/neva-logo.png",
    apple: "/neva-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}