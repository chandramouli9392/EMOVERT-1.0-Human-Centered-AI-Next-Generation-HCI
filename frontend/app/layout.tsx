import type { Metadata } from "next";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AIBackground } from "@/components/background/AIBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EMOVERT - Where Emotions Meet Intelligence",
  description:
    "AI-powered Emotional Wellness, Focus, Productivity, and Personal Growth Platform",
  keywords: [
    "emotional intelligence",
    "AI wellness",
    "focus tracking",
    "productivity",
    "mental health",
  ],
  authors: [{ name: "Chandramouli Boppana" }],
  openGraph: {
    title: "EMOVERT",
    description: "Where Emotions Meet Intelligence",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <AIBackground />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(10, 10, 15, 0.95)",
              border: "1px solid rgba(0, 240, 255, 0.2)",
              color: "#fff",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </body>
    </html>
  );
}
