import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ApotekIn",
  description: "Sistem Manajemen Apotek Digital",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${InterFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
