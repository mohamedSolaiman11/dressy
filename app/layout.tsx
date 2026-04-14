import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة الفساتين",
  description: "منصة عربية بسيطة لإدارة وتأجير الفساتين",
  applicationName: "منصة الفساتين",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "منصة الفساتين",
    statusBarStyle: "default"
  },
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#9d5c68",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
