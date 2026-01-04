import { GoogleGenAI } from "@google/genai";

const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getModelName = () =>
  process.env.GEMINI_MODEL || "models/gemini-2.5-flash";

const extractResponseText = async (response) => {
  if (!response) {
    return "";
  }
  if (typeof response.text === "string") {
    return response.text;
  }
  if (typeof response.text === "function") {
    return await response.text();
  }
  return "";
};

const parseJsonFromResponse = async (response) => {
  const responseText = await extractResponseText(response);
  if (!responseText) {
    return null;
  }
  const cleanedJson = responseText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(cleanedJson);
  } catch (error) {
    return null;
  }
};

export { aiClient, getModelName, extractResponseText, parseJsonFromResponse };
