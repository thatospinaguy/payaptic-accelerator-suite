import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-inter",
  weight: "100 900",
});

const robotoMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-roboto-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Payaptic Oracle Accelerator Suite",
  description:
    "Internal tooling suite for Oracle HCM Cloud implementation accelerators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
      <html lang="en">
        <body
          className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
