import type { Metadata } from "next";
import "./globals.css";
import './prosemirror.css'
import { Providers } from "@/providers/providers";
import UserProvider from "@/providers/UserProvider";
import { bric } from "@/utils/font";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Blogora",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bric} antialiased`}
      >
        <Providers>
          <UserProvider>
            <Header />
            {children}
            <Toaster />
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
