import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import { AudioProvider } from "@/components/GlobalAudioContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "VAJRA | Strategic Command Platform",
  description: "Indian Geopolitical Strategic Intelligence Command Room",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="bg-obsidian-950 text-white antialiased" suppressHydrationWarning>
        <AudioProvider>
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] scanner overflow-hidden"></div>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
