import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  donors: defineTable({
    name: v.string(),

    // URL returned by Vercel Blob
    imageUrl: v.string(),

    // Optional phone/email if you ever need it
    // (can be removed if you don't want it)
    phone: v.optional(v.string()),

    // Allows manual ordering if needed
    displayOrder: v.optional(v.number()),

    createdAt: v.number(),
  }).index("by_name", ["name"]),

  donations: defineTable({
    donorId: v.id("donors"),

    amount: v.number(),

    // Optional note
    note: v.optional(v.string()),

    createdAt: v.number(),
  })
    // Index for querying all donations of a donor
    .index("by_donor", ["donorId"])

    // Index for latest donations
    .index("by_createdAt", ["createdAt"]),
});
