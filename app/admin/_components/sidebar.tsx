"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, HandCoins, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const links = [
  { label: "Dashboard", href: "/admin/info", icon: LayoutDashboard },
  { label: "Donor Management", href: "/admin/donors", icon: Users },
  { label: "Add Donations", href: "/admin/donations", icon: HandCoins },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={
              active
                ? "flex items-center gap-3 px-4 py-3 bg-[#008751] text-[#fdfff9] text-sm font-bold uppercase tracking-[0.05em] rounded"
                : "flex items-center gap-3 px-4 py-3 text-[#3e4a41] hover:text-[#006b3f] transition-colors text-sm font-bold uppercase tracking-[0.05em] rounded"
            }
          >
            <link.icon className="size-5" fill={active ? "currentColor" : "none"} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col h-screen sticky top-0 bg-white border-r-2 border-[#008751]">
      <div className="p-8 border-b-2 border-[#e5e2e1]">
        <h1 className="font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#006b3f] uppercase tracking-tighter">
          ASD ADMIN
        </h1>
      </div>
      <NavLinks />
    </aside>
  );
}

export function MobileTopBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b-2 border-[#008751]">
      <h1 className="font-[family-name:var(--font-anton)] text-[20px] leading-[24px] text-[#006b3f] uppercase tracking-tighter">
        ASD ADMIN
      </h1>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation"
            className="p-2 border-2 border-[#008751] text-[#006b3f] rounded"
          >
            <Menu className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-white border-r-2 border-[#008751]">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="p-8 border-b-2 border-[#e5e2e1]">
            <SheetClose asChild>
              <h1 className="font-[family-name:var(--font-anton)] text-[24px] leading-[28px] text-[#006b3f] uppercase tracking-tighter">
                ASD ADMIN
              </h1>
            </SheetClose>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}