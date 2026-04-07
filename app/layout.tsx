import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أتيليه روز",
  description: "نموذج واجهة إدارة أتيليه موبايل-أول للعربي RTL",
  applicationName: "أتيليه روز",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "أتيليه روز",
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
