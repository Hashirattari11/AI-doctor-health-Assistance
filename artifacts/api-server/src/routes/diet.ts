import { Router, type IRouter } from "express";
import { db, dietPlansTable, reportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateDietPlan } from "../lib/ai";
import { GetDietSuggestionsBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/diet/suggest", async (req, res): Promise<void> => {
  const parsed = GetDietSuggestionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { userId, reportId, conditions = [], preferences } = parsed.data;

  let allConditions = [...conditions];

  if (reportId) {
    const [report] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.id, reportId))
      .limit(1);

    if (report) {
      allConditions = [...allConditions, ...report.possibleConditions];
    }
  }

  if (allConditions.length === 0) {
    allConditions = ["general health maintenance"];
  }

  req.log.info({ userId, conditions: allConditions }, "Generating diet plan");

  const plan = await generateDietPlan(allConditions, preferences ?? undefined);

  const [dietPlan] = await db
    .insert(dietPlansTable)
    .values({
      userId,
      reportId: reportId ?? null,
      toEat: plan.toEat,
      toAvoid: plan.toAvoid,
      lifestyleTips: plan.lifestyleTips,
      doctorRecommendation: plan.doctorRecommendation,
      conditions: allConditions,
    })
    .returning();

  res.json({
    id: dietPlan.id,
    userId: dietPlan.userId,
    toEat: dietPlan.toEat,
    toAvoid: dietPlan.toAvoid,
    lifestyleTips: dietPlan.lifestyleTips,
    doctorRecommendation: dietPlan.doctorRecommendation,
    createdAt: dietPlan.createdAt,
  });
});

export default router;
