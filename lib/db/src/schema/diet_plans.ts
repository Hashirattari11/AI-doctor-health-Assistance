import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dietPlansTable = pgTable("diet_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  reportId: uuid("report_id"),
  toEat: jsonb("to_eat").notNull().default([]),
  toAvoid: jsonb("to_avoid").notNull().default([]),
  lifestyleTips: text("lifestyle_tips").array().notNull().default([]),
  doctorRecommendation: text("doctor_recommendation"),
  conditions: text("conditions").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDietPlanSchema = createInsertSchema(dietPlansTable).omit({ id: true, createdAt: true });
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;
export type DietPlan = typeof dietPlansTable.$inferSelect;
