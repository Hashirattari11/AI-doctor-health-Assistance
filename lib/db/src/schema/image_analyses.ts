import { pgTable, text, uuid, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const imageAnalysesTable = pgTable("image_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  confidence: real("confidence").notNull().default(0),
  confidenceLevel: text("confidence_level").notNull().default("low"),
  results: jsonb("results").notNull().default([]),
  overallWellness: text("overall_wellness").notNull().default(""),
  disclaimer: text("disclaimer").notNull().default("Face analysis is not a medical diagnosis."),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertImageAnalysisSchema = createInsertSchema(imageAnalysesTable).omit({ id: true, createdAt: true });
export type InsertImageAnalysis = z.infer<typeof insertImageAnalysisSchema>;
export type ImageAnalysis = typeof imageAnalysesTable.$inferSelect;
