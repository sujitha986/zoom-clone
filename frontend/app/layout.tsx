import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoom Clone",
  description: "A Zoom-style meeting dashboard built for an SDE assessment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
