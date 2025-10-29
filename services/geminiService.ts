
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT_GENERATION_MODEL = 'gemini-2.5-flash';
const IMAGE_GENERATION_MODEL = 'imagen-4.0-generate-001';

interface PromptGenerationResult {
    coverPrompt: string;
    pagePrompts: string[];
}

export async function generateColoringPages(theme: string, name: string): Promise<string[]> {
    try {
        const promptGenerator = ai.models.generateContent({
            model: PROMPT_GENERATION_MODEL,
            contents: `You are a creative assistant for children's content. A user wants a 5-page coloring book with a cover. The theme is '${theme}' and it's for a child named '${name}'. Generate creative and simple prompts for each of the 5 pages and the cover. The cover prompt must include the child's name. The prompts should describe scenes suitable for a young child's coloring page. Respond with ONLY a valid JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        coverPrompt: { type: Type.STRING },
                        pagePrompts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["coverPrompt", "pagePrompts"],
                },
            },
        });
        
        const promptResponse = await promptGenerator;
        const promptJson: PromptGenerationResult = JSON.parse(promptResponse.text);

        const allPrompts = [promptJson.coverPrompt, ...promptJson.pagePrompts];
        
        if (allPrompts.length !== 6) {
            throw new Error("Failed to generate the correct number of prompts.");
        }

        const imagePromises = allPrompts.map(prompt => {
            const fullPrompt = `A children's coloring book page. Scene: ${prompt}. Art style: thick, clean black outlines, no color, no shading, simple and cute vector style, for kids.`;
            return ai.models.generateImages({
                model: IMAGE_GENERATION_MODEL,
                prompt: fullPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });
        });

        const imageResults = await Promise.all(imagePromises);
        
        const base64Images = imageResults.map(res => {
            if (res.generatedImages && res.generatedImages.length > 0) {
                return res.generatedImages[0].image.imageBytes;
            }
            throw new Error("Image generation failed for one or more prompts.");
        });

        return base64Images;

    } catch (error) {
        console.error("Error generating coloring pages:", error);
        throw new Error("Could not generate coloring book. Please try a different theme.");
    }
}

export function startChat(): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a friendly, patient, and fun chatbot for children. Use simple words and be encouraging. Keep your answers short and easy to understand.',
        },
    });
}

export async function sendMessageToBot(chat: Chat, message: string): Promise<AsyncGenerator<GenerateContentResponse>> {
    return chat.sendMessageStream({ message });
}
