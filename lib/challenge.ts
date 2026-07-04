import type { Doc, Id } from "../convex/_generated/dataModel";
import { TOTAL_CHALLENGE_SLOTS, EUROS_PER_SLOT } from "./constants";

// ── Types ──

export type DonationWithDonor = Doc<"donations"> & {
  donor: Doc<"donors"> | null;
};

export interface OccupiedSlot {
  kind: "occupied";
  donorId: Id<"donors">;
  donor: Doc<"donors">;
  totalDonated: number;
}

export interface EmptySlot {
  kind: "empty";
}

export type ChallengeSlot = OccupiedSlot | EmptySlot;

export interface ChallengeBoardResult {
  /** Exactly TOTAL_CHALLENGE_SLOTS entries. */
  board: ChallengeSlot[];
  /** Latest non-empty note per donor (for the dialog). */
  donorLatestNote: Map<Id<"donors">, string | undefined>;
}

// ── Algorithm ──

/**
 * Build the 200-slot challenge board from all donations.
 *
 * Business rules (from instruction.md):
 * - Slot count per donor = floor(totalDonated / EUROS_PER_SLOT).
 * - Donations below €100 cumulative earn no slot.
 * - Donor images are repeated per slot (not stretched).
 * - A donor's slots are consecutive (grouped).
 * - Slot order = oldest qualifying donor first
 *   (qualifies when cumulative total first reaches ≥ €100).
 * - Fill top-left → left-to-right, top-to-bottom.
 * - Exactly TOTAL_CHALLENGE_SLOTS cells; overflow truncated, underflow padded with empty.
 *
 * ASSUMPTION: "Oldest qualifying donor first" = ordered by when cumulative total
 * first reached ≥ €100 (tie-break: first-ever donation).
 */
export function buildChallengeBoard(
  donations: DonationWithDonor[],
): ChallengeBoardResult {
  // 1. Chronological order (oldest first)
  const chrono = [...donations].sort(
    (a, b) => a.createdAt - b.createdAt,
  );

  // 2. Per-donor accumulation + qualification timestamp
  const total = new Map<Id<"donors">, number>();
  const qualifiedAt = new Map<Id<"donors">, number>();
  const firstDonationAt = new Map<Id<"donors">, number>();

  for (const d of chrono) {
    if (!d.donor) continue; // orphan donation (shouldn't happen)
    total.set(d.donorId, (total.get(d.donorId) ?? 0) + d.amount);
    if (!firstDonationAt.has(d.donorId)) {
      firstDonationAt.set(d.donorId, d.createdAt);
    }
    if (
      (total.get(d.donorId) ?? 0) >= EUROS_PER_SLOT &&
      !qualifiedAt.has(d.donorId)
    ) {
      qualifiedAt.set(d.donorId, d.createdAt);
    }
  }

  // 3. Qualifying donors, sorted oldest-qualifier-first
  const qualifiers = [...qualifiedAt.entries()]
    .map(([donorId, qAt]) => {
      const donor = chrono.find((d) => d.donorId === donorId)!.donor!;
      return {
        donorId,
        donor,
        totalDonated: total.get(donorId)!,
        qAt,
        firstAt: firstDonationAt.get(donorId)!,
      };
    })
    .sort((a, b) => a.qAt - b.qAt || a.firstAt - b.firstAt);

  // 4. Build occupied slots (each donor's slots are consecutive)
  const occupied: OccupiedSlot[] = [];
  for (const q of qualifiers) {
    const count = Math.floor(q.totalDonated / EUROS_PER_SLOT);
    for (let i = 0; i < count; i++) {
      occupied.push({
        kind: "occupied",
        donorId: q.donorId,
        donor: q.donor,
        totalDonated: q.totalDonated,
      });
    }
  }

  // 5. Warn if overfunded
  if (occupied.length > TOTAL_CHALLENGE_SLOTS) {
    console.warn(
      `[challenge] ${occupied.length} occupied slots but only ${TOTAL_CHALLENGE_SLOTS} available — truncating.`,
    );
  }

  // 6. Fixed-length board
  const board: ChallengeSlot[] = [];
  for (let i = 0; i < TOTAL_CHALLENGE_SLOTS; i++) {
    board.push(occupied[i] ?? { kind: "empty" });
  }

  // 7. Latest non-empty note per donor (donations already newest-first in input)
  const donorLatestNote = new Map<Id<"donors">, string | undefined>();
  for (const d of donations) {
    if (d.donorId && d.note?.trim() && !donorLatestNote.has(d.donorId)) {
      donorLatestNote.set(d.donorId, d.note.trim());
    }
  }

  return { board, donorLatestNote };
}

/**
 * Summarise the donations list into derived values for the page.
 */
export function summariseDonations(donations: DonationWithDonor[]) {
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const donorCount = new Set(donations.map((d) => d.donorId)).size;
  // already newest-first from getDonationsWithDonors
  const latestDonations = donations.slice(0, 10);

  return { totalRaised, donorCount, latestDonations };
}