"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#hero" },
  { label: "Our Goal", href: "#progress" },
  { label: "Donate", href: "#contribute" },
  { label: "About", href: "#impact" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  return (
    <nav
      className="bg-[#fcf9f8] w-full top-0 sticky border-b-2 border-[#006b3f] z-50"
      dir="ltr"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        {/* Logo */}
        <div className="font-[family-name:var(--font-anton)] text-[20px] leading-[28px] text-[#006b3f] uppercase tracking-tighter">
          ASD Soccer Club
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = link.label === "Our Goal";
            return (
              <a
                key={link.href}
                className={
                  isActive
                    ? "text-[#006b3f] font-bold border-b-2 border-[#fed17b]"
                    : "text-[#1c1b1b] hover:text-[#006b3f] transition-colors duration-200"
                }
                href={link.href}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <a
          href="#contribute"
          className="hidden md:inline-flex font-bold text-[14px] tracking-[0.05em] uppercase bg-[#fed17b] text-[#1c1b1b] px-6 py-3 rounded-sm active:scale-90 transition-transform min-h-[44px] items-center"
        >
          Support Now
        </a>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href="#contribute"
            className="font-bold text-[12px] tracking-[0.05em] uppercase bg-[#fed17b] text-[#1c1b1b] px-3 py-2 rounded-sm min-h-[44px] inline-flex items-center"
          >
            Support Now
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                aria-label="Open menu"
              >
                <span className="material-symbols-outlined no-rtl text-[#1c1b1b]">
                  menu
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    className="text-[18px] font-bold text-[#1c1b1b] hover:text-[#006b3f] transition-colors py-2"
                    href={link.href}
                    onClick={close}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#contribute"
                  className="font-bold text-[14px] tracking-[0.05em] uppercase bg-[#fed17b] text-[#1c1b1b] px-6 py-3 rounded-sm text-center mt-4 min-h-[44px] inline-flex items-center justify-center"
                  onClick={close}
                >
                  Support Now
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}