import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoteCollab - Collaborative Note-Taking with AI & Quiz Generation",
  description:
    "The ultimate note-taking platform that combines real-time collaboration, AI assistance, and intelligent quiz generation. Create, collaborate, and learn together with powerful features designed to supercharge your productivity.",
  keywords:
    "note-taking, collaboration, AI, quiz generation, real-time editing, productivity, learning, team notes",
  authors: [{ name: "NoteCollab Team" }],
  openGraph: {
    title: "NoteCollab - Collaborative Note-Taking with AI",
    description:
      "Create, collaborate, and learn together with AI-powered note-taking and quiz generation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
