import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BRC Loralai Alumni Network",
  description: "Connecting Koharians worldwide - Alumni network for Balochistan Residential College, Loralai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
