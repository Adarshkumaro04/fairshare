import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT =
  'You are a witty personal finance assistant. Extract the expense details (amount, description, date) from the input. Also: 1. Categorize it into one of: Food, Travel, Rent, Entertainment, Utilities, Other. 2. Add a short, lightly sarcastic one-liner about the spending if it seems excessive or frivolous — keep it friendly, not mean. Return valid JSON ONLY: { "amount": number, "description": "string", "date": "YYYY-MM-DD", "category": "string", "comment": "string" }';

function extractJsonPayload(text) {
  const trimmed = (text || "").trim();

  if (!trimmed) {
    throw new Error("No response returned from the AI model.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch ? fencedMatch[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The response was not valid JSON.");
  }

  return candidate.slice(start, end + 1);
}

function normalizeCategory(value) {
  const normalized = (value || "Other").toLowerCase();

  if (normalized.includes("food") || normalized.includes("meal") || normalized.includes("drink")) {
    return "Food";
  }

  if (normalized.includes("travel") || normalized.includes("flight") || normalized.includes("uber") || normalized.includes("taxi")) {
    return "Travel";
  }

  if (normalized.includes("rent") || normalized.includes("housing") || normalized.includes("mortgage")) {
    return "Rent";
  }

  if (normalized.includes("entertain") || normalized.includes("movie") || normalized.includes("game") || normalized.includes("concert")) {
    return "Entertainment";
  }

  if (normalized.includes("utility") || normalized.includes("electric") || normalized.includes("wifi") || normalized.includes("internet") || normalized.includes("bill")) {
    return "Utilities";
  }

  return "Other";
}

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text?.trim()) {
      return Response.json({ error: "Please provide some expense text to parse." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(text);
    const responseText = result.response.text();
    const payload = JSON.parse(extractJsonPayload(responseText));

    const amount = Number(payload.amount);
    const parsedDate = payload.date ? new Date(payload.date) : null;

    if (Number.isNaN(amount) || amount <= 0) {
      throw new Error("The AI response did not include a valid amount.");
    }

    if (!payload.description?.trim()) {
      throw new Error("The AI response did not include a description.");
    }

    if (!payload.date || Number.isNaN(parsedDate?.getTime())) {
      throw new Error("The AI response did not include a valid date.");
    }

    return Response.json({
      amount,
      description: payload.description.trim(),
      date: payload.date,
      category: normalizeCategory(payload.category),
      comment: payload.comment?.trim() || "",
    });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to parse expense." }, { status: 500 });
  }
}
