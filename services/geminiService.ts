import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODEL_NAME, SEO_PERSONA_INSTRUCTION } from "../constants";
import { GroundingChunk } from "../types";

// Initialize the client
// The API key is guaranteed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateSEOParams {
  prompt: string;
  useGrounding?: boolean;
  systemInstruction?: string;
  temperature?: number;
}

export interface SEOResponse {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export const generateSEOContent = async ({
  prompt,
  useGrounding = false,
  systemInstruction = SEO_PERSONA_INSTRUCTION,
  temperature = 0.7,
}: GenerateSEOParams): Promise<SEOResponse> => {
  try {
    const tools = useGrounding ? [{ googleSearch: {} }] : undefined;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction,
        temperature,
        tools,
      },
    });

    // Extract text
    const text = response.text || "No response generated.";
    
    // Extract grounding metadata if available
    // Note: The SDK types might be loose, so we safely access optional properties.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

    return {
      text,
      groundingChunks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};
