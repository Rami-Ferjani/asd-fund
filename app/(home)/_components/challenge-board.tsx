"use client";

import { useState, useCallback, useMemo } from "react";
import { useHomeData } from "./use-home-data";
import { DonorDialog } from "./donor-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { OccupiedSlot } from "@/lib/challenge";
import type { Doc } from "@/convex/_generated/dataModel";

export function ChallengeBoard() {
  const data = useHomeData();

  // Selected donor for the dialog
  const [selected, setSelected] = useState<{
    donor: Doc<"donors">;
    totalDonated: number;
    donorId: string;
  } | null>(null);

  const openDialog = useCallback((slot: OccupiedSlot) => {
    setSelected({
      donor: slot.donor,
      totalDonated: slot.totalDonated,
      donorId: slot.donorId,
    });
  }, []);

  const closeDialog = useCallback(() => setSelected(null), []);

  // Look up the latest note for the selected donor
  const selectedNote = useMemo(() => {
    if (!data || !selected) return undefined;
    return data.donorLatestNote.get(selected.donorId as never);
  }, [data, selected]);

  // ── Skeleton ──
  if (!data) {
    return (
      <section
        id="challenge"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-20"
      >
        <div className="text-center mb-6">
          <Skeleton className="h-[40px] w-[300px] mx-auto mb-4" />
          <Skeleton className="h-[28px] w-[500px] mx-auto" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </section>
    );
  }

  const { board } = data;

  return (
    <>
      <section
        id="challenge"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-20"
      >
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="font-[family-name:var(--font-anton)] uppercase text-[28px] leading-[34px] sm:text-[32px] sm:leading-[40px] text-[#006b3f] mb-4">
            تحدي الـ 200 خانة
          </h2>
          <p className="text-[18px] leading-[28px] text-[#3e4a41]">
            كل خانة تمثل{" "}
            <span className="font-bold text-[#1c1b1b]">100 يورو</span>. كون واحد
            من الـ 200 محب اللي باش يحققوا الحلم هذا.
          </p>
        </div>

        {/* Board container */}
        <div className="bg-[#fcf9f8] border-4 border-[#006b3f] p-3 sm:p-6 rounded-xl relative overflow-hidden">
          {/* Bus watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <span className="material-symbols-outlined no-rtl text-[300px]">
              directions_bus
            </span>
          </div>

          {/* Slot grid */}
          <div className="slot-grid relative z-10" dir="ltr">
            {board.map((slot, i) => {
              if (slot.kind === "empty") {
                return (
                  <div
                    key={i}
                    className="aspect-square bg-[#fcf9f8] hover:bg-[#fed17b] hover:border-[#006b3f] border border-[#bdcabe] cursor-pointer transition-colors rounded-sm flex items-center justify-center group"
                  >
                    <span className="material-symbols-outlined no-rtl text-[12px] text-[#e5e2e1] group-hover:text-[#1c1b1b]">
                      add
                    </span>
                  </div>
                );
              }

              // Occupied slot
              return (
                <button
                  key={i}
                  type="button"
                  className="aspect-square bg-[#008751] text-white flex items-center justify-center border border-[#6e7a70] text-xs font-bold rounded-sm shadow-sm overflow-hidden"
                  title={slot.donor.name}
                  onClick={() => openDialog(slot)}
                >
                  {slot.donor.imageUrl ? (
                    <img
                      alt={slot.donor.name}
                      className="w-full h-full object-cover rounded-sm"
                      src={slot.donor.imageUrl}
                    />
                  ) : (
                    <span className="material-symbols-outlined no-rtl text-[16px]">
                      sports_soccer
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donor Dialog */}
      <DonorDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        donor={selected?.donor ?? null}
        totalDonated={selected?.totalDonated ?? 0}
        latestNote={selectedNote}
      />
    </>
  );
}
