import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const createDonation = mutation({
  args: {
    donorId: v.id("donors"),
    amount: v.number(),
    note: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    if (args.amount <= 0 || !Number.isFinite(args.amount)) {
      throw new ConvexError("Donation amount must be a positive number.");
    }
    return await ctx.db.insert("donations", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getDonations = query({
  handler: async (ctx) => {
    return await ctx.db.query("donations").collect();
  },
});

export const getDonationById = query({
  args: {
    donationId: v.id("donations"),
  },

  handler: async (ctx, { donationId }) => {
    return await ctx.db.get(donationId);
  },
});

export const getDonationsByDonor = query({
  args: {
    donorId: v.id("donors"),
  },

  handler: async (ctx, { donorId }) => {
    return await ctx.db
      .query("donations")
      .withIndex("by_donor", (q) => q.eq("donorId", donorId))
      .collect();
  },
});

export const searchDonationsByDonor = query({
  args: {
    search: v.string(),
  },

  handler: async (ctx, { search }) => {
    const donors = await ctx.db.query("donors").collect();

    const matchingDonors = donors.filter((donor) =>
      donor.name.toLowerCase().includes(search.toLowerCase()),
    );

    const donorIds = new Set(matchingDonors.map((d) => d._id));

    const donations = await ctx.db.query("donations").collect();

    return donations.filter((donation) => donorIds.has(donation.donorId));
  },
});

export const updateDonation = mutation({
  args: {
    donationId: v.id("donations"),
    amount: v.number(),
    note: v.optional(v.string()),
  },

  handler: async (ctx, { donationId, ...rest }) => {
    // Validate that the number is positive and not NaN/Infinity
    if (rest.amount <= 0 || !Number.isFinite(rest.amount)) {
      throw new ConvexError("Donation amount must be a positive number.");
    }
    await ctx.db.patch(donationId, rest);
  },
});

export const deleteDonation = mutation({
  args: {
    donationId: v.id("donations"),
  },

  handler: async (ctx, { donationId }) => {
    await ctx.db.delete(donationId);
  },
});

export const getTotalRaised = query({
  handler: async (ctx) => {
    const donations = await ctx.db.query("donations").collect();

    const total = donations.reduce((sum, donation) => sum + donation.amount, 0);

    return total;
  },
});

export const getLatestDonations = query({
  handler: async (ctx) => {
    // Get latest donations first
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_createdAt")
      .order("desc")
      .take(10); // Change this number if you want more or fewer

    // Attach donor information
    const latestDonations = await Promise.all(
      donations.map(async (donation) => {
        const donor = await ctx.db.get(donation.donorId);

        return {
          ...donation,
          donor,
        };
      }),
    );

    return latestDonations;
  },
});
