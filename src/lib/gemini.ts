import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import type { AnalysisResult } from "@/types/shipment";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function readImageAsBase64(imagePath: string): {
  data: string;
  mimeType: string;
} {
  const fullPath = path.join(process.cwd(), "public", imagePath);
  const buffer = fs.readFileSync(fullPath);
  const data = buffer.toString("base64");

  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const mimeType = isPng ? "image/png" : "image/jpeg";

  return { data, mimeType };
}

const PROMPT = `You are an expert quality control AI for Floward, a premium flower and gifts retailer.

Analyze these two images:
- Image 1 (QC): Quality Control photo taken at the Floward warehouse before dispatch
- Image 2 (POD): Proof of Delivery photo taken at the customer's location

Compare them strictly:
1. Verify both images show a bouquet/flower arrangement
2. Check the overall type, shape, and style of the arrangement
3. Compare specific flower colors, types, and count/density
4. Inspect the wrapping, vase, or container for damage
5. Look for signs of wilting, crushed petals, or missing stems
6. Assess if lighting/angle differences are hiding damage

Return ONLY a JSON object (no markdown, no extra text):
{
  "recommendation": "Approve" or "Review",
  "confidenceScore": <0-100>,
  "reasoning": ["<point 1>", "<point 2>", "<point 3 if needed>"]
}

Use "Approve" only if the product clearly matches with no visible damage.
Use "Review" if there is ANY discrepancy, damage, missing items, or if images are too blurry to assess.`;

export async function analyzeShipmentImages(
  qcImagePath: string,
  podImagePath: string
): Promise<AnalysisResult> {
  try {
    const qcImage = readImageAsBase64(qcImagePath);
    const podImage = readImageAsBase64(podImagePath);

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
