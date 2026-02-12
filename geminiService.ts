import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "./shared";

const parsePacketWithGemini = async (text: string): Promise<ExtractedData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a data parsing assistant specialized in Roblox network packets and API responses. 
      Analyze the following text which represents a Roblox data packet, log, or JSON snippet. 
      Extract the "Game Name" (or Place Name/Universe Name) and the "Game ID" (Universe ID, Place ID, or Game ID).
      
      Input Text:
      """
      ${text.slice(0, 30000)} 
      """
      
      If the text contains the data, extract it. If the name is missing but ID is present, use "Unknown Game" for name.
      If the ID is missing, try to find any numeric identifier associated with "PlaceId", "UniverseId", or "GameId".
      If absolutely nothing is found, return "N/A" for both.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameName: {
              type: Type.STRING,
              description: "The name of the Roblox game found in the text.",
            },
            gameId: {
              type: Type.STRING,
              description: "The ID of the Roblox game found in the text.",
            },
          },
          required: ["gameName", "gameId"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ExtractedData;
      return data;
    }
    
    throw new Error("No response text from Gemini.");

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to analyze packet. Please check the input format.");
  }
};

export { parsePacketWithGemini };
