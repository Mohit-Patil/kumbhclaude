import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

// One superfamily across scripts (constraint 5).
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-latin",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-dev",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Punarmilan · Kumbh Khoya–Paya",
  description:
    "Punarmilan reunites people separated at the Kumbh — register your family, report a missing or found person, and let any booth match them in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoDevanagari.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
