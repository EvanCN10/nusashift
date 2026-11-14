import type { Metadata } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "lenis/dist/lenis.css";
import LenisProvider from "@/components/LenisProvider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
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
      className={`${instrumentSerif.variable} ${geist.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-canvas-900 text-ink-primary font-sans antialiased selection:bg-drought-orange/30">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
