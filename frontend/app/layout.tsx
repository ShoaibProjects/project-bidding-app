import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Load Outfit font
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Project Bidding Platform",
  description: "Connect buyers and sellers through seamless project bidding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-outfit antialiased bg-[#f9f9fc] text-gray-800">
        {children}
      </body>
    </html>
  );
}
