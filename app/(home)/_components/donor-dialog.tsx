"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatEur } from "@/lib/format";

interface DonorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: Doc<"donors"> | null;
  totalDonated: number;
  latestNote?: string;
}

export function DonorDialog({
  open,
  onOpenChange,
  donor,
  totalDonated,
  latestNote,
}: DonorDialogProps) {
  if (!donor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] rounded-sm">
        <DialogTitle className="sr-only">
          {donor.name} - Donation Details
        </DialogTitle>

        <div className="flex flex-col items-center gap-4 pt-4 text-center" dir="rtl">
          {/* Profile picture */}
          <Avatar className="w-24 h-24 sm:w-40 sm:h-40 rounded-sm">
            <AvatarImage src={donor.imageUrl} alt={donor.name} />
            <AvatarFallback className="bg-[#7a590c] text-white rounded-sm text-3xl">
              <span className="material-symbols-outlined no-rtl text-[48px]">
                sports_soccer
              </span>
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <h3 className="font-[family-name:var(--font-anton)] uppercase text-[28px] leading-[34px] sm:text-[32px] sm:leading-[40px] text-[#1c1b1b]">
            {donor.name}
          </h3>

          {/* Total donated */}
          <div className="bg-[#313030] text-[#fcf9f8] px-6 py-2 rounded-full font-[family-name:var(--font-anton)] text-[24px]">
            {formatEur(totalDonated)}
          </div>

          {/* Donation message (only if present) */}
          {latestNote && (
            <p className="text-[16px] leading-[24px] text-[#3e4a41] italic mt-2 px-2">
              &ldquo;{latestNote}&rdquo;
            </p>
          )}

          {/* Close button */}
          <DialogClose className="mt-4 font-bold text-[14px] tracking-[0.05em] uppercase bg-[#fed17b] text-[#1c1b1b] px-8 py-3 rounded-sm hover:bg-[#008751] hover:text-white transition-colors min-h-[44px]">
            إغلاق
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}