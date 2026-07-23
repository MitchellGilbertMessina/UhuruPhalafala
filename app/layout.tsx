import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uhuru Phalafala",
  description: "Artist website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}