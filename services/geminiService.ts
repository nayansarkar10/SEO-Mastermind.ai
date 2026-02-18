import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODEL_NAME, IMAGE_MODEL_NAME, SEO_PERSONA_INSTRUCTION, IMAGE_PERSONA_PROMPT } from "../constants";
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

interface GenerateImageParams {
  prompt: string;
  previousImageBase64?: string; // For editing/refining
}

export interface ImageResponse {
  imageBase64?: string;
  text?: string;
}

export const generateMarketingImage = async ({
  prompt,
  previousImageBase64
}: GenerateImageParams): Promise<ImageResponse> => {
  try {
    // Construct the prompt with the persona
    const fullPrompt = `${IMAGE_PERSONA_PROMPT}\n\nTask: ${prompt}`;
    
    const parts: any[] = [];
    
    // If there's a previous image, include it for editing/refining
    if (previousImageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG for simplicity, usually safe for generated images
          data: previousImageBase64
        }
      });
    }

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME, // gemini-2.5-flash-image (Nano banana)
      contents: {
        parts: parts
      },
      config: {
         // Nano banana does not support responseMimeType or systemInstruction in the same way as text models sometimes,
         // but we put the persona in the text prompt.
         // It generates images by default when prompted to do so.
      }
    });

    let imageBase64: string | undefined;
    let text: string | undefined;

    // Iterate through parts to find image or text
    const responseParts = response.candidates?.[0]?.content?.parts;
    if (responseParts) {
      for (const part of responseParts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
        } else if (part.text) {
          text = (text || '') + part.text;
        }
      }
    }

    return { imageBase64, text };

  } catch (error) {
    console.error("Gemini Image API Error:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};
