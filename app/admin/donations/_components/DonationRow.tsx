"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

import { TableRow, TableCell } from "@/components/ui/table";
import { formatEur, formatDate } from "@/lib/format";
import { EditDonationDialog } from "./EditDonationDialog";
import { DeleteDonationDialog } from "./DeleteDonationDialog";

export type DonationWithDonor = {
  _id: Id<"donations">;
  donorId: Id<"donors">;
  amount: number;
  note?: string;
  createdAt: number;
  donor: {
    _id: Id<"donors">;
    _creationTime: number;
    name: string;
    phone?: string;
    imageUrl: string;
  } | null;
};

export function DonationDesktopRow({
  d,
  index,
}: {
  d: DonationWithDonor;
  index: number;
}) {
  return (
    <TableRow
      className={`hover:bg-[#fcf9f8] ${index % 2 === 1 ? "bg-[#f6f3f2]" : ""}`}
    >
      <TableCell className="p-4">
        <div className="font-bold text-[#1c1b1b] text-base">
          {d.donor?.name ?? "Unknown"}
        </div>
        <div className="text-sm text-[#3e4a41]">{d.donor?.phone || "—"}</div>
      </TableCell>
      <TableCell className="p-4 font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px]">
        {formatEur(d.amount)}
      </TableCell>
      <TableCell className="p-4 text-[#3e4a41]">
        {formatDate(d.createdAt)}
      </TableCell>
      <TableCell className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <EditDonationDialog donation={d} />
          <DeleteDonationDialog donation={d} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function DonationMobileCard({ d }: { d: DonationWithDonor }) {
  return (
    <div className="bg-white border border-[#e5e2e1] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-[#1c1b1b] truncate">
            {d.donor?.name ?? "Unknown"}
          </div>
          <div className="text-sm text-[#3e4a41] truncate">
            {d.donor?.phone || "—"}
          </div>
        </div>
        <div className="font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px] whitespace-nowrap">
          {formatEur(d.amount)}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[#3e4a41]">
          {formatDate(d.createdAt)}
        </span>
        <div className="flex gap-2">
          <EditDonationDialog donation={d} />
          <DeleteDonationDialog donation={d} />
        </div>
      </div>
    </div>
  );
}
