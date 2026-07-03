import type { ReactNode } from "react";
import { Anton, Be_Vietnam_Pro } from "next/font/google";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${anton.variable} ${beVietnam.variable} flex min-h-screen bg-[#fcf9f8] text-[#1c1b1b]`}
    >
      {children}
    </div>
  );
}