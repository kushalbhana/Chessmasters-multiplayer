import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Providers } from "./providers";
import { BottomBar } from "@/components/shared/bottombar"; // ✅ Import BottomBar

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Chessmasters multiplayer",
  description:
    "Chessmasters Multiplayer offers real-time online chess with seamless gameplay. Play with friends, challenge random players, or compete against AI. Features include live video calls, match analysis, secure scalable servers, and an engaging experience for chess lovers of all skill levels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex">
            {/* Sidebar only visible on large screens */}
            <div className="hidden lg:block md:w-60">
              <Sidebar />
            </div>

            <div className="w-full">{children}</div>
          </div>

          {/* ✅ Bottom bar for small & tablet devices */}
          <BottomBar />

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
