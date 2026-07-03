"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anton, Be_Vietnam_Pro } from "next/font/google";
import { LayoutDashboard, Users, HandCoins } from "lucide-react";

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

function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/admin/info", icon: LayoutDashboard },
    { label: "Donor Management", href: "/admin/donors", icon: Users },
    { label: "Add Donations", href: "/admin/donations", icon: HandCoins },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col h-screen sticky top-0 bg-white border-r-2 border-[#008751]">
      <div className="p-8 border-b-2 border-[#e5e2e1]">
        <h1 className="font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#006b3f] uppercase tracking-tighter">
          ASD ADMIN
        </h1>
      </div>
      <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "flex items-center gap-3 px-4 py-3 bg-[#008751] text-[#fdfff9] text-sm font-bold uppercase tracking-[0.05em] rounded"
                  : "flex items-center gap-3 px-4 py-3 text-[#3e4a41] hover:text-[#006b3f] transition-colors text-sm font-bold uppercase tracking-[0.05em] rounded"
              }
            >
              <link.icon
                className="size-5"
                fill={active ? "currentColor" : "none"}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${anton.variable} ${beVietnam.variable} flex min-h-screen bg-[#fcf9f8] text-[#1c1b1b]`}
    >
      <Sidebar />
      {children}
    </div>
  );
}