"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  buildChallengeBoard,
  summariseDonations,
  type ChallengeBoardResult,
} from "@/lib/challenge";

/**
 * Single composed query that drives every data-dependent section on the
 * public home page.  Returns `undefined` while loading so consumers can
 * render their skeletons.
 */
export function useHomeData(): ChallengeBoardResult & {
  totalRaised: number;
  donorCount: number;
  latestDonations: ReturnType<typeof summariseDonations>["latestDonations"];
} {
  const donations = useQuery(api.donations.getDonationsWithDonors);

  if (donations === undefined) {
    // Still loading — let each section show its own skeleton.
    return undefined as unknown as ReturnType<typeof useHomeData>;
  }

  const { totalRaised, donorCount, latestDonations } =
    summariseDonations(donations);

  const { board, donorLatestNote } = buildChallengeBoard(donations);

  return {
    board,
    donorLatestNote,
    totalRaised,
    donorCount,
    latestDonations,
  };
}