"use client";

import { AddDonationForm } from "./_components/AddDonationForm";
import { DonationsTable } from "./_components/DonationsTable";
import { Toaster } from "@/components/ui/sonner";

export default function DonationsPage() {
  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 flex flex-col gap-6">
      {/* Page header — stacked on mobile, row on sm+ */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-anton)] text-[28px] sm:text-[32px] lg:text-[40px] leading-[34px] sm:leading-[40px] text-[#006b3f] uppercase tracking-tighter">
            Add Donations
          </h1>
          <p className="text-[#3e4a41] text-sm sm:text-base mt-1">
            Record offline contributions and manage recent donations.
          </p>
        </div>
      </header>

      {/* 12-col grid: form (4) + list (8) on lg; stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <section className="lg:col-span-4">
          <AddDonationForm />
        </section>
        <section className="lg:col-span-8">
          <DonationsTable />
        </section>
      </div>

      <Toaster />
    </main>
  );
}