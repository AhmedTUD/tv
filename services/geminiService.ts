import { GoogleGenAI } from "@google/genai";
import { TVModel, ComparisonField, AIComparisonResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert consumer electronics consultant specializing in TVs.
You speak Arabic fluently.
Your goal is to compare provided TV models based on their specifications.
Provide a concise summary highlighting key differences, pros, and cons.
Finally, give a clear verdict on which TV is better for: 1. Gaming, 2. Movies, 3. Budget.
Output JSON only.
`;

export const getAIComparison = async (
  models: TVModel[],
  fields: ComparisonField[]
): Promise<AIComparisonResult | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare data for the model
  const modelsData = models.map(m => ({
    name: m.name,
    brand: m.brand,
    specs: fields.map(f => ({
      label: f.label,
      value: m.specs[f.id],
      unit: f.unit
    }))
  }));

  const prompt = `
  Compare the following TV models:
  ${JSON.stringify(modelsData, null, 2)}

  Return a JSON object with this structure:
  {
    "summary": "Detailed comparison summary in Arabic...",
    "verdict": "Verdict summary in Arabic (Best for X, Y, Z)..."
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as AIComparisonResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};