import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { createArrestDeclaration } from "./mutation";

export const bookingStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("needs_correction")
);

export const sirActivity = v.array(
  v.object({
    event_time: v.string(),
    penal_code: v.object({
      codeType: v.string(),
      code_number: v.string(),
      m_f: v.string(),
      narrative: v.string(),
    }),
    city: v.optional(v.string()),
    location: v.string(),
    subject_info: v.string(),
    narrative: v.string(),
    file_number: v.optional(v.string()),
    incident_type: v.optional(v.string()),
  })
);

export default defineSchema({
  crimeElement: defineTable({
    pcId: v.id("pc"),
    element: v.array(v.string()),
    calcrim_example: v.array(v.string()),
  }).index("by_pcId", ["pcId"]),

  // CODE #,CODE TYPE,NARRATIVE,M/F
  pc: defineTable({
    code_number: v.string(),
    codeType: v.string(),
    narrative: v.string(),
    m_f: v.union(v.literal("M"), v.literal("F")),
  })
    .searchIndex("search_narrative", {
      searchField: "narrative",
      filterFields: ["code_number"],
    })
    .searchIndex("search_code_number", {
      searchField: "code_number",
    }),
  booking: defineTable({
    data: v.any(),
    charges: v.array(v.any()),
    causeId: v.optional(v.id("cause")),
    userId: v.optional(v.id("user")),
    status: v.optional(bookingStatus),
  }),
  cause: defineTable({
    data: v.any(),
    isFirstMsgId: v.optional(v.id("messages")),
    userId: v.optional(v.id("user")),
  }),
  arrestDeclaration: defineTable({
    data: v.any(),
  }),
  calcrim: defineTable({
    text: v.string(),
    embedding: v.array(v.number()),
  }).vectorIndex("by_embedding", {
    dimensions: 1536,
    vectorField: "embedding",
  }),

  messages: defineTable({
    isViewer: v.boolean(),
    sessionId: v.string(),
    text: v.string(),
  }).index("bySessionId", ["sessionId"]),
  signature: defineTable({
    base64Sign: v.string(),
    userName: v.string(),
  }),

  user: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    fullName: v.string(),
    pictureUrl: v.string(),
    phoneNumber: v.optional(v.string()),
    tokenIdentifier: v.string(),

    approved: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .searchIndex("search_hunter", {
      searchField: "fullName",
      filterFields: ["email"],
    }),

  sir: defineTable({
    date: v.string(),
    activities: sirActivity,
    userId: v.optional(v.id("user")),
  }),
});
