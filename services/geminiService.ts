
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { MODEL_FLASH, MODEL_FLASH_IMAGE } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const editImage = async (imageFile: File, prompt: string): Promise<string> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: MODEL_FLASH_IMAGE,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image was generated in the response.");
  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit image. Please check the console for details.");
  }
};

export const analyzeImage = async (imageFile: File): Promise<string> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: "Describe this image in detail. What is happening? What objects are present? What is the mood?" };

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image. Please check the console for details.");
  }
};


export const generateMemeCaptions = async (imageFile: File): Promise<string[]> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const prompt = "You are a witty and creative meme expert. Analyze the provided image and generate exactly 5 funny, viral-worthy captions for it. Your response MUST be a valid JSON object with a single key 'captions' which is an array of 5 strings. Each string should be a short, punchy caption.";

        const response = await ai.models.generateContent({
            model: MODEL_FLASH,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        captions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A funny meme caption."
                            }
                        }
                    },
                    required: ["captions"]
                }
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        
        if (result && Array.isArray(result.captions) && result.captions.length > 0) {
            return result.captions;
        } else {
            throw new Error("Invalid JSON response or empty captions array.");
        }

    } catch (error) {
        console.error("Error generating captions:", error);
        throw new Error("Failed to generate captions. The model may have returned an unexpected format.");
    }
};
