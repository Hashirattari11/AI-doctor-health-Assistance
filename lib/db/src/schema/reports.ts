import { pgTable, text, uuid, timestamp, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  fileName: text("file_name").notNull(),
  confidence: real("confidence").notNull().default(0),
  confidenceLevel: text("confidence_level").notNull().default("low"),
  values: jsonb("values").notNull().default([]),
  possibleConditions: text("possible_conditions").array().notNull().default([]),
  explanation: text("explanation").notNull().default(""),
  emergencyAlert: boolean("emergency_alert").notNull().default(false),
  emergencyMessage: text("emergency_message"),
  disclaimer: text("disclaimer").notNull().default("This is AI-generated guidance, not a medical diagnosis."),
  recommendations: text("recommendations").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
