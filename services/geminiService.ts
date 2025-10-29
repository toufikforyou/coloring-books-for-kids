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

export async function generateColoringPages(theme: string, name: string, numPages: number): Promise<string[]> {
    try {
        const promptGenerator = ai.models.generateContent({
            model: PROMPT_GENERATION_MODEL,
            contents: `You are a creative assistant for children's content. A user wants a ${numPages}-page coloring book with a cover. The theme is '${theme}' and it's for a child named '${name}'. Generate creative and simple prompts for each of the ${numPages} pages and the cover. The cover prompt must include the child's name. The prompts should describe scenes suitable for a young child's coloring page. Respond with ONLY a valid JSON object.`,
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

        const allPrompts = [promptJson.coverPrompt, ...promptJson.pagePrompts].filter(p => p); // Filter out any empty prompts

        if (allPrompts.length < numPages + 1) {
            throw new Error(`The AI only generated ${allPrompts.length - 1} pages. Please try a different theme.`);
        }

        const base64Images: string[] = [];
        // Generate images sequentially to avoid hitting API rate limits.
        for (const prompt of allPrompts) {
            const fullPrompt = `A children's coloring book page. Scene: ${prompt}. Art style: thick, clean black outlines, no color, no shading, simple and cute vector style, for kids.`;
            const imageResult = await ai.models.generateImages({
                model: IMAGE_GENERATION_MODEL,
                prompt: fullPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });

            if (imageResult.generatedImages && imageResult.generatedImages.length > 0) {
                base64Images.push(imageResult.generatedImages[0].image.imageBytes);
            } else {
                throw new Error("Image generation failed for one of the prompts.");
            }
        }

        return base64Images;

    } catch (error) {
        console.error("Error generating coloring pages:", error);
        if (error instanceof Error && error.message.includes("RESOURCE_EXHAUSTED")) {
            throw new Error("The image generator is very busy right now. Please wait a moment and try again.");
        }
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