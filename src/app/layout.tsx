import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ClientLayout from "./ClientLayout";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VinnovateIT 2026",
  description: "You're In!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased bg-black text-white`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
