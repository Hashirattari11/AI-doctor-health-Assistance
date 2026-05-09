import { Router, type IRouter } from "express";
import multer from "multer";
import { eq } from "drizzle-orm";
import { db, reportsTable, dietPlansTable } from "@workspace/db";
import { analyzeReportWithAI, generateDietPlan } from "../lib/ai";
import { logger } from "../lib/logger";
import { sendPushToUser } from "./notifications";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/reports/analyze", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided", message: "Please upload a PDF or image file" });
    return;
  }

  const userId = req.body.userId as string;
  if (!userId) {
    res.status(400).json({ error: "Missing userId", message: "userId is required" });
    return;
  }

  req.log.info({ userId, fileName: req.file.originalname }, "Analyzing medical report");

  let fileContent = "";
  const mimeType = req.file.mimetype;

  if (mimeType.startsWith("image/")) {
    const base64 = req.file.buffer.toString("base64");
    fileContent = `[Image file: ${req.file.originalname}] Base64 data available for analysis`;

    try {
      const OpenAI = (await import("openai")).default;
      const openaiClient = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });

      const ocrResponse = await openaiClient.chat.completions.create({
        model: "gpt-5.4",
        max_completion_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all text content from this medical report image. Return only the extracted text." },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
      });
      fileContent = ocrResponse.choices[0]?.message?.content ?? fileContent;
    } catch (err) {
      logger.warn({ err }, "OCR failed, using filename for analysis");
    }
  } else {
    fileContent = `[PDF file: ${req.file.originalname}] Document uploaded for analysis`;
  }

  const analysis = await analyzeReportWithAI(fileContent, req.file.originalname);

  const [report] = await db
    .insert(reportsTable)
    .values({
      userId,
      fileName: req.file.originalname,
      confidence: analysis.confidence,
      confidenceLevel: analysis.confidenceLevel,
      values: analysis.values,
      possibleConditions: analysis.possibleConditions,
      explanation: analysis.explanation,
      emergencyAlert: analysis.emergencyAlert,
      emergencyMessage: analysis.emergencyMessage,
      recommendations: analysis.recommendations,
      disclaimer: "This is AI-generated guidance, not a medical diagnosis.",
    })
    .returning();

  res.json({
    id: report.id,
    userId: report.userId,
    fileName: report.fileName,
    confidence: report.confidence,
    confidenceLevel: report.confidenceLevel,
    values: report.values,
    possibleConditions: report.possibleConditions,
    explanation: report.explanation,
    emergencyAlert: report.emergencyAlert,
    emergencyMessage: report.emergencyMessage ?? undefined,
    disclaimer: report.disclaimer,
    recommendations: report.recommendations,
    createdAt: report.createdAt,
  });

  if (userId) {
    sendPushToUser(userId, {
      title: analysis.emergencyAlert ? "⚠️ Lumina Health Alert" : "✅ Report Analysis Complete",
      body: analysis.emergencyAlert
        ? `Urgent finding in ${req.file.originalname}. Please review immediately.`
        : `Your report "${req.file.originalname}" has been analyzed. Confidence: ${analysis.confidenceLevel}.`,
      icon: "/favicon.ico",
      url: `/history`,
    }).catch((err) => logger.warn({ err }, "Push notification failed"));
  }
});

router.get("/reports/:id/pdf", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, raw))
    .limit(1);

  if (!report) {
    res.status(404).json({ error: "Report not found", message: "The requested report does not exist" });
    return;
  }

  res.json({
    downloadUrl: `/api/reports/${raw}/pdf/download`,
    reportId: raw,
    generatedAt: new Date(),
  });
});

export default router;
