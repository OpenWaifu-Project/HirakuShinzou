import * as z from "zod";

const topggSchema = z.object({
	bot: z.string(),
	user: z.string(),
	type: z.enum(["upvote", "test"]),
	isWeekend: z.boolean().optional(),
	query: z.string().optional(),
});

export { topggSchema };
