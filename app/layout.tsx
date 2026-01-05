import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SteamLib - Your Personal Steam Library Manager",
  description: "Manage and explore your Steam library with rich metadata and a premium experience.",
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
