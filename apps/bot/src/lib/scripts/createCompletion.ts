import {
	GoogleGenerativeAI,
	HarmBlockThreshold,
	HarmCategory,
	Content,
	GoogleGenerativeAIFetchError,
} from "@google/generative-ai";
import { container } from "../../inversify.config";
import { Hiraku } from "../structures/hiraku";
import { Message } from "seyfert/lib/structures";

const genAI = new GoogleGenerativeAI(`${process.env.GOOGLE_AI_KEY_1}`);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const threshold = HarmBlockThreshold.BLOCK_NONE;
let currTokenId = 1;

const modelProVision = genAI.getGenerativeModel({
	model: "gemini-pro-vision",
	safetySettings: [
		{
			category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
			threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_HARASSMENT,
			threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
			threshold: HarmBlockThreshold.BLOCK_NONE,
		},
		{
			category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
			threshold: HarmBlockThreshold.BLOCK_NONE,
		},
	],
});

export async function createGeminiCompletion(history: Content[], prompt: Content): Promise<string> {
	const formattedPrompt = prompt.parts[0].text!;
	const userName = prompt.parts[0].text?.match(/^.*:/)![0].slice(0, -1);

	container.get(Hiraku).logger.info(`${userName} asked: ${formattedPrompt}`);

	const chat = model.startChat({
		history: [...history],
		// generationConfig: {
		// 	maxOutputTokens: 412,
		// 	temperature: 0.9,
		// 	topK: 1,
		// 	topP: 1,
		// },
		safetySettings: [
			{
				category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
				threshold,
			},
			{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold },
			{ category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold },
			{
				category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
				threshold,
			},
		],
	});

	const result = await chat.sendMessage(formattedPrompt).catch((err: GoogleGenerativeAIFetchError) => {
		console.error(err);
		if (err.status === 429) {
			// chenge token
			currTokenId = currTokenId + 1 > 4 ? 1 : currTokenId + 1;
			container.get(Hiraku).logger.info(`Changed token to ${currTokenId}`);
			genAI.apiKey = process.env[`GOOGLE_AI_KEY_${currTokenId}`]!;
			model.apiKey = genAI.apiKey;
			return createGeminiCompletion(history, prompt);
		}

		return "Sorry, I'm having trouble understanding you. Could you try again?";
	});

	if (typeof result === "string") return result;

	const response = result.response.text();

	const responseText = response
		.replace("Hiraku Shinzou:", "")
		.replace(/(<(END_OF_REPLY|RULES|RULE|BANS)>\s*.*)/i, "")
		.slice(0, 1500)
		.trim();

	container.get(Hiraku).logger.info(`Gemini replied: ${responseText}`);

	return responseText;
}

export async function createGeminiImage(files: Message["attachments"], prompt: string) {
	const filesBuffer = await Promise.all(
		files.map(async (file) => {
			const res = await fetch(file.url);
			const buffer = await res.arrayBuffer();
			const MAX_SIZE = 4 * 1024 * 1024;

			if (buffer.byteLength > MAX_SIZE) {
				return "Sorry, the image is too large. Please try again with a smaller image. (Max 4MB)";
			}

			return {
				inlineData: {
					data: Buffer.from(buffer).toString("base64"),
					mimeType: file.contentType ?? "image/jpeg",
				},
			};
		})
	);

	const result = await modelProVision.generateContent([prompt, ...filesBuffer]);
	const response = result.response.text();

	return response;
}
