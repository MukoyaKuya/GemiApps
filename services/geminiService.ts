import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ConversionResponse, ContentType } from "../types";

const SYSTEM_PROMPT = `
You are an advanced Document Layout Analysis AI. Your goal is to perfectly transcribe a scanned document into a structured format that can be rebuilt as a Microsoft Word document.

Analyze the document provided (image or PDF). Identify the structure:
1. Headings (detect hierarchy level 1-3). Titles and Subtitles are headings.
2. Paragraphs (detect alignment).
3. Tables (extract content faithfully cell by cell).

Rules:
- TRANSCRIPTION MUST BE EXACT. Do not correct grammar or spelling. Type exactly what you see.
- Preserve numerical figures, names, and codes exactly.
- Detect text alignment (center, left, right).
- For tables, ensure the number of columns is consistent across rows.
- Handle "Target Lines" or labeled lines as paragraphs or headings depending on emphasis.
- If a line is bold or standalone, consider if it is a heading.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    elements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: [ContentType.HEADING, ContentType.PARAGRAPH, ContentType.TABLE] },
          text: { type: Type.STRING, description: "Content for headings and paragraphs" },
          level: { type: Type.INTEGER, description: "Heading level 1-3 (only for headings)" },
          align: { type: Type.STRING, enum: ["left", "center", "right", "justify"] },
          isBold: { type: Type.BOOLEAN },
          rows: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: "2D array of strings for table content (only for tables)"
          }
        },
        required: ["type"]
      }
    }
  },
  required: ["elements"]
};

export const analyzeDocument = async (base64Image: string, mimeType: string): Promise<ConversionResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this document and extract its structure and text content according to the JSON schema."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as ConversionResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};