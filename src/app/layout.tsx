import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "NusaShift | Coupled Earth-System Regime & Lag-Cascade Detective (NASA Space Apps 2026)",
  description:
    "Paired-region NASA POWER climate teleconnection & water-energy lag-cascade statistical analyzer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-canvas-900 text-ink-primary font-sans antialiased selection:bg-drought-orange/30">
        {children}
      </body>
    </html>
  );
}
