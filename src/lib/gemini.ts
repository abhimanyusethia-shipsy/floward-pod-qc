import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from "@/types/shipment";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function fetchImageAsBase64(imageUrl: string): Promise<{
  data: string;
  mimeType: string;
}> {
  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const data = buffer.toString("base64");

  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const mimeType = isPng ? "image/png" : "image/jpeg";

  return { data, mimeType };
}

const PROMPT = `You are an expert quality control AI for Floward, a premium flower and gifts retailer.

You will receive two images:
- Image 1 (QC): Quality Control photo taken at the Floward warehouse before dispatch
- Image 2 (POD): Proof of Delivery photo taken at the customer's location

Your ONLY job is to verify the PRODUCT CONDITION. Compare:
1. Does the POD show the same type of bouquet/arrangement as the QC?
2. Are the flower colors, types, and count/density consistent?
3. Is there any visible damage: wilting, crushed petals, missing stems, broken vase/wrapping?
4. Is anything clearly missing or substituted?

IMPORTANT:
- Different backgrounds, lighting, or camera angles are EXPECTED and must NOT affect your judgment.
- If both images show the same product in the same condition, recommend "Approve" — even if the photos look very similar or identical.
- Only recommend "Review" if there is visible damage, a wrong/different product, missing items, or the images are too blurry to assess.

Return ONLY a JSON object (no markdown, no extra text):
{
  "recommendation": "Approve" or "Review",
  "confidenceScore": <0-100>,
  "reasoning": ["<point 1>", "<point 2>", "<point 3 if needed>"]
}`;

export async function analyzeShipmentImages(
  qcImagePath: string,
  podImagePath: string
): Promise<AnalysisResult> {
  try {
    const qcImage = await fetchImageAsBase64(qcImagePath);
    const podImage = await fetchImageAsBase64(podImagePath);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: { data: qcImage.data, mimeType: qcImage.mimeType },
      },
      {
        inlineData: { data: podImage.data, mimeType: podImage.mimeType },
      },
    ]);

    const text = result.response.text();
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      recommendation: parsed.recommendation === "Approve" ? "Approve" : "Review",
      confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidenceScore) || 0)),
      reasoning: Array.isArray(parsed.reasoning)
        ? parsed.reasoning.map(String)
        : ["No reasoning provided"],
    };
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      recommendation: "Review",
      confidenceScore: 0,
      reasoning: [
        "AI analysis failed — please retry or review manually",
        error instanceof Error ? error.message : "Unknown error",
      ],
    };
  }
}
