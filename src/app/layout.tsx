import type { Metadata } from "next";
<<<<<<< HEAD
import { Geist, Geist_Mono } from "next/font/google";
=======
import { Inter } from "next/font/google";
>>>>>>> origin/branch1
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import UserSync from "@/components/UserSync";
import TanStackProvider from "@/components/providers/TanStackProvider";
import { Toaster } from "sonner";

<<<<<<< HEAD
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
=======
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
>>>>>>> origin/branch1
});

export const metadata: Metadata = {
  title: "Oral-Sense AI Dental Assistant",
  description:
    "Get instant dental advice through voice calls with our AI assistant. Avaiable 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanStackProvider>
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: "#e78a53",
            colorBackground: "#f3f4f6",
            colorText: "#111827",
            colorTextSecondary: "#6b7280",
            colorInputBackground: "#f3f4f6",
          },
        }}
      >
        <html lang="en">
<<<<<<< HEAD
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
=======
          <body className={`${inter.className} antialiased dark`}>
>>>>>>> origin/branch1
            {/* this is done in the home page component */}
            {/* <UserSync /> */}
            <Toaster />
            {children}
          </body>
        </html>
      </ClerkProvider>
    </TanStackProvider>
  );
}