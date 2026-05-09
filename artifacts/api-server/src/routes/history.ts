import { Router, type IRouter } from "express";
import { and, eq, desc } from "drizzle-orm";
import { db, reportsTable, imageAnalysesTable, dietPlansTable } from "@workspace/db";
import {
  GetHistoryQueryParams,
  GetHistoryItemParams,
  ClearHistoryQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/history", async (req, res): Promise<void> => {
  const parsed = GetHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { userId, type = "all" } = parsed.data;

  const items: Array<{
    id: string;
    userId: string;
    type: "report" | "image" | "diet";
    title: string;
    summary: string;
    confidence?: number;
    createdAt: Date;
    data: unknown;
  }> = [];

  if (type === "all" || type === "report") {
    const reports = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.userId, userId))
      .orderBy(desc(reportsTable.createdAt));

    for (const r of reports) {
      items.push({
        id: r.id,
        userId: r.userId,
        type: "report",
        title: r.fileName,
        summary: `${r.possibleConditions.length} possible conditions identified — ${r.confidence.toFixed(0)}% confidence`,
        confidence: r.confidence,
        createdAt: r.createdAt,
        data: r,
      });
    }
  }

  if (type === "all" || type === "image") {
    const analyses = await db
      .select()
      .from(imageAnalysesTable)
      .where(eq(imageAnalysesTable.userId, userId))
      .orderBy(desc(imageAnalysesTable.createdAt));

    for (const a of analyses) {
      const results = a.results as Array<{ indicator: string; message: string }>;
      items.push({
        id: a.id,
        userId: a.userId,
        type: "image",
        title: "Face Wellness Analysis",
        summary: results.length > 0 ? results[0].message : a.overallWellness,
        confidence: a.confidence,
        createdAt: a.createdAt,
        data: a,
      });
    }
  }

  if (type === "all" || type === "diet") {
    const plans = await db
      .select()
      .from(dietPlansTable)
      .where(eq(dietPlansTable.userId, userId))
      .orderBy(desc(dietPlansTable.createdAt));

    for (const p of plans) {
      const toEat = p.toEat as Array<{ food: string }>;
      items.push({
        id: p.id,
        userId: p.userId,
        type: "diet",
        title: "Diet Plan",
        summary: `${toEat.length} recommended foods, ${(p.toAvoid as unknown[]).length} foods to avoid`,
        createdAt: p.createdAt,
        data: p,
      });
    }
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ items, total: items.length });
});

router.delete("/history", async (req, res): Promise<void> => {
  const parsed = ClearHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { userId } = parsed.data;

  await Promise.all([
    db.delete(reportsTable).where(eq(reportsTable.userId, userId)),
    db.delete(imageAnalysesTable).where(eq(imageAnalysesTable.userId, userId)),
    db.delete(dietPlansTable).where(eq(dietPlansTable.userId, userId)),
  ]);

  res.json({ message: "History cleared successfully" });
});

router.get("/history/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  // Try all tables
  const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, raw)).limit(1);
  if (report) {
    res.json({
      id: report.id,
      userId: report.userId,
      type: "report",
      title: report.fileName,
      summary: `${report.possibleConditions.length} possible conditions — ${report.confidence.toFixed(0)}% confidence`,
      confidence: report.confidence,
      createdAt: report.createdAt,
      data: report,
    });
    return;
  }

  const [imageAnalysis] = await db.select().from(imageAnalysesTable).where(eq(imageAnalysesTable.id, raw)).limit(1);
  if (imageAnalysis) {
    const results = imageAnalysis.results as Array<{ indicator: string; message: string }>;
    res.json({
      id: imageAnalysis.id,
      userId: imageAnalysis.userId,
      type: "image",
      title: "Face Wellness Analysis",
      summary: results.length > 0 ? results[0].message : imageAnalysis.overallWellness,
      confidence: imageAnalysis.confidence,
      createdAt: imageAnalysis.createdAt,
      data: imageAnalysis,
    });
    return;
  }

  const [dietPlan] = await db.select().from(dietPlansTable).where(eq(dietPlansTable.id, raw)).limit(1);
  if (dietPlan) {
    const toEat = dietPlan.toEat as Array<{ food: string }>;
    res.json({
      id: dietPlan.id,
      userId: dietPlan.userId,
      type: "diet",
      title: "Diet Plan",
      summary: `${toEat.length} recommended foods`,
      createdAt: dietPlan.createdAt,
      data: dietPlan,
    });
    return;
  }

  res.status(404).json({ error: "Not found", message: "History item not found" });
});

export default router;
