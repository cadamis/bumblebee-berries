import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bumblebee Berries",
  description: "Fresh local raspberries, picked with care.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
