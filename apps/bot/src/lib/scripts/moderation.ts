export async function checkModeration(text: string): Promise<string[]> {
	const data = (await fetch("https://api.openai.com/v1/moderations", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			input: text,
		}),
	}).then((d) => d.json())) as Moderation;

	if (!data.results[0].flagged) {
		return [];
	}

	const categories = Object.entries(data.results[0].categories)
		.filter(([_, v]) => v)
		.map(([k]) => k);
	return categories;
}

interface Moderation {
	id: string;
	model: string;
	results: Result[];
}

interface Result {
	flagged: boolean;
	categories: Categories;
	category_scores: CategoryScores;
}

interface Categories {
	sexual: boolean;
	hate: boolean;
	harassment: boolean;
	"self-harm": boolean;
	"sexual/minors": boolean;
	"hate/threatening": boolean;
	"violence/graphic": boolean;
	"self-harm/intent": boolean;
	"self-harm/instructions": boolean;
	"harassment/threatening": boolean;
	violence: boolean;
}

export interface CategoryScores {
	sexual: number;
	hate: number;
	harassment: number;
	"self-harm": number;
	"sexual/minors": number;
	"hate/threatening": number;
	"violence/graphic": number;
	"self-harm/intent": number;
	"self-harm/instructions": number;
	"harassment/threatening": number;
	violence: number;
}
