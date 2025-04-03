import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/provider/toaster-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dayliff| Quotation Web App",
  description: "Davis and ShirtLiff Proposed Quotation App",
  icons:{
    icon: "/davislogo.svg"
}
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}
          <ToastProvider/>
        </body>
      </html>
    </ClerkProvider>
  );
}
