
import { GoogleGenAI } from "@google/genai";
import { Operator, UnitId } from "../types.ts";
import { UNITS } from "../constants.ts";

// This check is important for modules that might be loaded in different environments.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not found. Gemini features will be disabled.");
}

// Initialize with a check to prevent errors if the key is missing.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getUnitInsight = async (
    input1: string,
    input2: string,
    operator: Operator,
    result: string,
    unitIds: UnitId[]
): Promise<string> => {
  if (!ai) {
    return "Gemini API key is not configured. Cannot fetch insights.";
  }

  const unitNames = [...new Set(unitIds.map(id => UNITS[id].name))].join(', ');

  const prompt = `
    I just performed a calculation in a US customary unit calculator.
    The operation was: (${input1}) ${operator} (${input2}), which resulted in: ${result}.
    The calculation involved these US units: ${unitNames}.

    Please provide a short, interesting, and little-known fact or a brief historical context related to one of these units.
    Keep the tone engaging and educational. Do not repeat the calculation.
    The response should be a single paragraph and be concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching insight from Gemini API:", error);
    return "Could not fetch an interesting fact at this time. Please check your API key and network connection.";
  }
};
