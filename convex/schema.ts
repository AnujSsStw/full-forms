import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    .index("by_code_number", ["code_number"]),
});
