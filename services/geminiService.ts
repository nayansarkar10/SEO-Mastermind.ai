import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODEL_NAME, IMAGE_MODEL_NAME, SEO_PERSONA_INSTRUCTION, IMAGE_PERSONA_PROMPT } from "../constants";
import { GroundingChunk, NewsItem } from "../types";

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

export const getDailySEONews = async (): Promise<NewsItem[]> => {
  try {
    const prompt = `Find the top 5 most important and trending news articles or blog posts related to SEO and Digital Marketing from the last 48 hours. 
    Focus on major updates from Google, new AI tools for marketing, or significant industry shifts.
    
    Return a strict JSON array (and ONLY the JSON array) where each object has these fields:
    - title: string
    - summary: string (max 2 concise sentences)
    - url: string (IMPORTANT: Must be a valid http/https URL to the actual article found)
    - source: string (e.g., Search Engine Journal, Google Blog)
    - date: string (e.g., "Apr 24, 2024")
    - author: string (optional, use "Editorial Team" if unknown)
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    // Parse the JSON
    // Note: The model is instructed to return JSON, but we should be safe
    let articles: NewsItem[] = [];
    try {
      articles = JSON.parse(jsonText);
    } catch (e) {
      // Fallback: Try to find JSON block if extra text exists
      const match = jsonText.match(/\[.*\]/s);
      if (match) {
        articles = JSON.parse(match[0]);
      }
    }

    return articles.slice(0, 5);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    // Return dummy data in case of failure to prevent UI break
    return [
      {
        title: "Google Announces New Search Core Update",
        summary: "The latest core update focuses on helpful content and reducing spam in search results.",
        url: "https://developers.google.com/search/blog",
        source: "Google Search Central",
        date: new Date().toLocaleDateString(),
        author: "Google Team"
      }
    ];
  }
};

export const fetchArticleContent = async (url: string, title: string): Promise<string> => {
  try {
    const prompt = `You are a helpful reading assistant. 
    The user wants to read the article titled "${title}" located at this URL: "${url}".
    
    Task:
    1. Use your search tools to access the content of this article or find reliable information matching this specific news story.
    2. Write a comprehensive, well-structured article summary that essentially reconstructs the main value of the content.
    3. Format it beautifully in Markdown.
    
    Structure:
    - Start with a clear H1 Headline.
    - Provide a "Key Takeaways" section with bullet points.
    - Follow with the detailed content body, using H2s for sub-sections.
    - Ensure it is easy to read and captures all important details from the source.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable search to "read" the page or find info
      },
    });

    return response.text || "Could not retrieve article content. Please try visiting the source directly.";
  } catch (error) {
    console.error("Error fetching article content:", error);
    return "Failed to load the article content. The source might be inaccessible.";
  }
};
