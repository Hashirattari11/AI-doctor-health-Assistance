import { Router, type IRouter } from "express";
import { openai } from "../lib/ai";
import { SendChatMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/chat/message", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { message, history = [] } = parsed.data;

  req.log.info({ messageLength: message.length }, "AI chat message received");

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    {
      role: "system",
      content: `You are Lumina, a caring and knowledgeable AI health assistant. 
You provide helpful, accurate, and empathetic health information and guidance.

IMPORTANT RULES:
- Never diagnose medical conditions with certainty — always say "possible" or "may indicate"
- Always recommend consulting a qualified doctor for serious concerns
- Be warm, supportive, and professional
- Keep responses concise and clear (2-4 sentences for simple questions, up to 6 for complex ones)
- End responses that involve symptoms or conditions with a reminder to consult a healthcare professional
- You can discuss: symptoms, nutrition, lifestyle, wellness, medications (general info), lab values, and health reports
- Never provide prescription advice or replace medical consultation`,
    },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 512,
    messages,
  });

  const reply = response.choices[0]?.message?.content ?? "I'm sorry, I couldn't process your message. Please try again.";

  res.json({
    reply,
    disclaimer: "This is AI-generated guidance, not a medical diagnosis. Always consult a qualified healthcare professional.",
  });
});

export default router;
