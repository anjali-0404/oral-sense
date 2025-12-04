import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import UserSync from "@/components/UserSync";
import TanStackProvider from "@/components/providers/TanStackProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
          <body className={`${inter.className} antialiased dark`}>
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