import { Router, type IRouter } from "express";
import multer from "multer";
import { db, imageAnalysesTable } from "@workspace/db";
import { analyzeImageWithAI } from "../lib/ai";
import { sendPushToUser } from "./notifications";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/image/analyze", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided", message: "Please upload an image file" });
    return;
  }

  const userId = req.body.userId as string;
  if (!userId) {
    res.status(400).json({ error: "Missing userId", message: "userId is required" });
    return;
  }

  if (!req.file.mimetype.startsWith("image/")) {
    res.status(400).json({ error: "Invalid file type", message: "Please upload an image file" });
    return;
  }

  req.log.info({ userId }, "Analyzing face image");

  const imageBase64 = req.file.buffer.toString("base64");
  const analysis = await analyzeImageWithAI(imageBase64);

  const [imageAnalysis] = await db
    .insert(imageAnalysesTable)
    .values({
      userId,
      confidence: analysis.confidence,
      confidenceLevel: analysis.confidenceLevel,
      results: analysis.results,
      overallWellness: analysis.overallWellness,
      disclaimer: "Face analysis is not a medical diagnosis.",
    })
    .returning();

  res.json({
    id: imageAnalysis.id,
    userId: imageAnalysis.userId,
    confidence: imageAnalysis.confidence,
    confidenceLevel: imageAnalysis.confidenceLevel,
    results: imageAnalysis.results,
    overallWellness: imageAnalysis.overallWellness,
    disclaimer: imageAnalysis.disclaimer,
    createdAt: imageAnalysis.createdAt,
  });

  sendPushToUser(userId, {
    title: "✅ Image Analysis Complete",
    body: `Your wellness scan is ready. Overall wellness: ${analysis.overallWellness}. Confidence: ${analysis.confidenceLevel}.`,
    icon: "/favicon.ico",
    url: "/history",
  }).catch(() => {});
});

export default router;
