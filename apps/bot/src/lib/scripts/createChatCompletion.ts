import { constants } from "../constants";
export async function createChatCompletion(
	url: keyof typeof constants.COMPLETION_APIS,
	body: RequestBody,
	messages: Message[]
) {
	const data = await fetch(constants.COMPLETION_APIS[url], {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${url === "OPENAI-URL" ? process.env.OPENAI_API_KEY : process.env.OPENROUTER_API_KEY}`,
		},
		body: JSON.stringify({ ...body, messages }),
	})
		.then((res) => res.json())
		.catch((e) => e);

	return data;
}

export interface Message {
	content: string;
	role: string;
}

export interface RequestBody {
	model: string;
	frequency_penalty: number | null;
	max_tokens: number | null;
	presence_penalty: number | null;
	top_p: number | null;
	temperature: number | null;
}
