import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Everstage Creative Studio",
  description: "LinkedIn ad creative generation for Everstage campaigns",
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
