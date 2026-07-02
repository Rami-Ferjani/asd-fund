import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createDonor = mutation({
  args: {
    name: v.string(),
    imageUrl: v.string(),
    phone: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("donors", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getDonors = query({
  handler: async (ctx) => {
    return await ctx.db.query("donors").collect();
  },
});

export const getDonorById = query({
  args: {
    donorId: v.id("donors"),
  },

  handler: async (ctx, { donorId }) => {
    return await ctx.db.get(donorId);
  },
});

export const searchDonors = query({
  args: {
    search: v.string(),
  },

  handler: async (ctx, { search }) => {
    const donors = await ctx.db.query("donors").withIndex("by_name").collect();

    return donors.filter((donor) =>
      donor.name.toLowerCase().includes(search.toLowerCase()),
    );
  },
});

export const updateDonor = mutation({
  args: {
    donorId: v.id("donors"),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
  },

  handler: async (ctx, { donorId, ...rest }) => {
    await ctx.db.patch(donorId, rest);
  },
});

export const deleteDonor = mutation({
  args: {
    donorId: v.id("donors"),
  },

  handler: async (ctx, { donorId }) => {
    await ctx.db.delete(donorId);
  },
});
