import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, reportsTable, imageAnalysesTable, dietPlansTable } from "@workspace/db";
import { GetDashboardSummaryQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/summary/dashboard", async (req, res): Promise<void> => {
  const parsed = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { userId } = parsed.data;

  const [reports, imageAnalyses, dietPlans] = await Promise.all([
    db.select().from(reportsTable).where(eq(reportsTable.userId, userId)).orderBy(desc(reportsTable.createdAt)),
    db.select().from(imageAnalysesTable).where(eq(imageAnalysesTable.userId, userId)).orderBy(desc(imageAnalysesTable.createdAt)),
    db.select().from(dietPlansTable).where(eq(dietPlansTable.userId, userId)).orderBy(desc(dietPlansTable.createdAt)),
  ]);

  const allConf = [...reports.map(r => r.confidence), ...imageAnalyses.map(a => a.confidence)];
  const averageConfidence = allConf.length > 0
    ? allConf.reduce((sum, c) => sum + c, 0) / allConf.length
    : 0;

  const alertsCount = reports.filter(r => r.emergencyAlert).length;

  const recentActivity: Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    summary: string;
    confidence?: number;
    createdAt: Date;
  }> = [
    ...reports.slice(0, 3).map(r => ({
      id: r.id,
      userId: r.userId,
      type: "report" as const,
      title: r.fileName,
      summary: `${r.possibleConditions.length} possible conditions — ${r.confidence.toFixed(0)}% confidence`,
      confidence: r.confidence,
      createdAt: r.createdAt,
    })),
    ...imageAnalyses.slice(0, 2).map(a => ({
      id: a.id,
      userId: a.userId,
      type: "image" as const,
      title: "Face Wellness Analysis",
      summary: a.overallWellness,
      confidence: a.confidence,
      createdAt: a.createdAt,
    })),
    ...dietPlans.slice(0, 2).map(p => ({
      id: p.id,
      userId: p.userId,
      type: "diet" as const,
      title: "Diet Plan",
      summary: `${(p.toEat as unknown[]).length} recommended foods`,
      createdAt: p.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  res.json({
    totalAnalyses: reports.length + imageAnalyses.length + dietPlans.length,
    reportsAnalyzed: reports.length,
    imagesAnalyzed: imageAnalyses.length,
    dietPlansGenerated: dietPlans.length,
    recentActivity,
    averageConfidence: Math.round(averageConfidence),
    alertsCount,
  });
});

export default router;
