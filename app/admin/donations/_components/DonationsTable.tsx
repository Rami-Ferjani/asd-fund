"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Filter, Download } from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DonationDesktopRow,
  DonationMobileCard,
  type DonationWithDonor,
} from "./DonationRow";

const PAGE_SIZE = 10;

export function DonationsTable() {
  const rows = useQuery(api.donations.getDonationsWithDonors);

  const [page, setPage] = useState(0);

  const total = rows?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = useMemo(() => {
    if (!rows) return undefined;
    return rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  }, [rows, safePage]);

  const showingFrom = total === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const showingTo = Math.min((safePage + 1) * PAGE_SIZE, total);

  return (
    <div className="bg-white border border-[#e5e2e1] p-5 sm:p-6 shadow-[8px_8px_0px_#f0eded] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e5e2e1]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-[family-name:var(--font-anton)] text-[20px] leading-[24px] text-[#1c1b1b] uppercase truncate">
            Recent Donations
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="icon" className="rounded-none border-[#e5e2e1] text-[#3e4a41] hover:text-[#006b3f] size-9" aria-label="Filter">
            <Filter className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-none border-[#e5e2e1] text-[#3e4a41] hover:text-[#006b3f] size-9" aria-label="Download">
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {rows === undefined && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {/* Empty */}
      {rows !== undefined && rows.length === 0 && (
        <div className="p-8 text-center text-[#3e4a41]">No donations yet.</div>
      )}

      {/* Desktop table (>= md) */}
      {rows !== undefined && rows.length > 0 && (
        <div className="hidden md:block flex-1 overflow-auto">
          <Table className="w-full text-left border-collapse">
            <TableHeader>
              <TableRow className="bg-[#eae7e7] border-b-2 border-[#008751] hover:bg-[#eae7e7]">
                <TableHead className="p-4 text-xs font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">Donor</TableHead>
                <TableHead className="p-4 text-xs font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">Amount</TableHead>
                <TableHead className="p-4 text-xs font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">Date</TableHead>
                <TableHead className="p-4 text-xs font-bold uppercase tracking-[0.05em] text-[#1c1b1b] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged?.map((d, i) => (
                <DonationDesktopRow key={d._id} d={d as DonationWithDonor} index={i} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mobile cards (< md) */}
      {rows !== undefined && rows.length > 0 && (
        <div className="md:hidden flex-1 flex flex-col gap-3">
          {paged?.map((d) => (
            <DonationMobileCard key={d._id} d={d as DonationWithDonor} />
          ))}
        </div>
      )}

      {/* Footer / pagination */}
      {rows !== undefined && rows.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#e5e2e1] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[#3e4a41] text-sm">
          <span>
            Showing {showingFrom}–{showingTo} of {total} donations
          </span>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-none border-[#e5e2e1] disabled:opacity-50 h-9"
            >
              Prev
            </Button>
            {Array.from({ length: pageCount }).slice(0, 5).map((_, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => setPage(i)}
                className={`rounded-none h-9 ${
                  i === safePage
                    ? "border-[#008751] bg-[#008751] text-[#fdfff9]"
                    : "border-[#e5e2e1] text-[#1c1b1b]"
                }`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-none border-[#e5e2e1] disabled:opacity-50 h-9"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}