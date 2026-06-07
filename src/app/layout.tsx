import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coffee Tracker",
  description: "Catat dan analisis konsumsi kopi dan gula harianmu dengan desain minimalis OLED.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-white selection:text-black`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#000",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              borderRadius: "0",
            },
          }}
        />
      </body>
    </html>
  );
}
