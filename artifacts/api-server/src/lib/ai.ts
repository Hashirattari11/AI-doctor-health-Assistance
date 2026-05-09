import OpenAI from "openai";

if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
  throw new Error("AI_INTEGRATIONS_OPENAI_BASE_URL is required");
}
if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  throw new Error("AI_INTEGRATIONS_OPENAI_API_KEY is required");
}

export const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface ReportValue {
  name: string;
  value: string;
  unit?: string;
  status: "normal" | "high" | "low" | "critical";
  normalRange?: string;
}

export interface ReportAnalysisResult {
  confidence: number;
  confidenceLevel: "high" | "medium" | "low";
  values: ReportValue[];
  possibleConditions: string[];
  explanation: string;
  emergencyAlert: boolean;
  emergencyMessage?: string;
  recommendations: string[];
}

export interface ImageAnalysisResultItem {
  indicator: string;
  message: string;
  severity: "low" | "medium" | "high";
}

export interface ImageAnalysisResult {
  confidence: number;
  confidenceLevel: "high" | "medium" | "low";
  results: ImageAnalysisResultItem[];
  overallWellness: string;
}

export interface DietItem {
  food: string;
  reason: string;
  category: string;
}

export interface DietPlanResult {
  toEat: DietItem[];
  toAvoid: DietItem[];
  lifestyleTips: string[];
  doctorRecommendation: string;
}

export async function analyzeReportWithAI(fileContent: string, fileName: string): Promise<ReportAnalysisResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are a medical report analyzer. Analyze the provided medical report content and extract key values.
IMPORTANT RULES:
- Never claim 100% accuracy
- Always provide a confidence score between 40-90
- Only identify "possible conditions", never confirmed diagnoses
- Flag any critical values as emergencies
- Be conservative in your analysis

Respond with ONLY valid JSON in this exact format:
{
  "confidence": <number 40-90>,
  "confidenceLevel": "<high|medium|low>",
  "values": [
    {"name": "<test name>", "value": "<value>", "unit": "<unit>", "status": "<normal|high|low|critical>", "normalRange": "<range>"}
  ],
  "possibleConditions": ["<condition1>", "<condition2>"],
  "explanation": "<brief explanation>",
  "emergencyAlert": <true|false>,
  "emergencyMessage": "<message if emergency>",
  "recommendations": ["<recommendation1>", "<recommendation2>"]
}`,
      },
      {
        role: "user",
        content: `Analyze this medical report (${fileName}):\n\n${fileContent}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(content) as ReportAnalysisResult;
    return parsed;
  } catch {
    return {
      confidence: 60,
      confidenceLevel: "medium",
      values: [],
      possibleConditions: ["Unable to extract specific conditions"],
      explanation: "The report content could not be fully parsed. Please ensure the report is clearly visible.",
      emergencyAlert: false,
      recommendations: ["Please consult a doctor for accurate interpretation"],
    };
  }
}

export async function analyzeImageWithAI(imageBase64: string): Promise<ImageAnalysisResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are a wellness image analyzer. Analyze ONLY visible wellness indicators from facial images.
STRICT RESTRICTIONS:
- ONLY analyze: skin condition (acne, dullness), eye fatigue signs, hydration indicators, general wellness hints
- NEVER diagnose diseases or medical conditions
- Always express findings as "possible signs of..." or "may indicate..."
- Confidence score must be between 45-80

Respond with ONLY valid JSON:
{
  "confidence": <number 45-80>,
  "confidenceLevel": "<high|medium|low>",
  "results": [
    {"indicator": "<skin/eyes/hydration/wellness>", "message": "<possible sign of...>", "severity": "<low|medium|high>"}
  ],
  "overallWellness": "<brief overall wellness statement>"
}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze the wellness indicators in this face image:",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(content) as ImageAnalysisResult;
    return parsed;
  } catch {
    return {
      confidence: 55,
      confidenceLevel: "medium",
      results: [
        { indicator: "general", message: "Image analysis completed with limited detail", severity: "low" },
      ],
      overallWellness: "Please ensure good lighting for more accurate analysis",
    };
  }
}

export async function generateDietPlan(conditions: string[], preferences?: string): Promise<DietPlanResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are a nutritionist AI providing dietary guidance based on health conditions.
Generate a personalized diet plan. Always recommend consulting a doctor for medical conditions.

Respond with ONLY valid JSON:
{
  "toEat": [
    {"food": "<food name>", "reason": "<why beneficial>", "category": "<fruits/vegetables/proteins/grains/dairy/etc>"}
  ],
  "toAvoid": [
    {"food": "<food to avoid>", "reason": "<why to avoid>", "category": "<category>"}
  ],
  "lifestyleTips": ["<tip1>", "<tip2>", "<tip3>"],
  "doctorRecommendation": "<recommendation to see doctor>"
}`,
      },
      {
        role: "user",
        content: `Create a diet plan for someone with the following conditions: ${conditions.join(", ")}${preferences ? `. Preferences: ${preferences}` : ""}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content) as DietPlanResult;
  } catch {
    return {
      toEat: [
        { food: "Fresh fruits and vegetables", reason: "Rich in vitamins and antioxidants", category: "general" },
        { food: "Whole grains", reason: "Provides sustained energy", category: "grains" },
        { food: "Lean proteins", reason: "Essential for body repair", category: "proteins" },
      ],
      toAvoid: [
        { food: "Processed foods", reason: "High in sodium and preservatives", category: "processed" },
        { food: "Sugary drinks", reason: "Contribute to metabolic issues", category: "beverages" },
      ],
      lifestyleTips: [
        "Stay hydrated — drink 8 glasses of water daily",
        "Exercise for at least 30 minutes most days",
        "Get 7-9 hours of quality sleep each night",
      ],
      doctorRecommendation: "Please consult a healthcare professional for personalized medical advice.",
    };
  }
}
