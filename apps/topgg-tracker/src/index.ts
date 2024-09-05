import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { topggSchema } from "./topgg.schema";
import { processVote } from "./script";
import * as fs from "node:fs";
import { DiscordAPIError } from "seyfert";
import { Papr } from "@repo/database";
import { papr } from "./papr";

const app = new Hono();

app.use("*", async (c, next) => {
	const AuthHeader = c.req.raw.headers.get("Authorization");
	if (!AuthHeader) {
		return c.json({
			error: "No auth header",
		});
	}
	if (AuthHeader !== process.env.TOPGG_AUTHORIZATION) {
		return c.json({
			error: "Invalid auth header",
		});
	}

	await next();
});

app.get("/", (c) => {
	return c.json({
		message: "Hello world!",
	});
});

app.post("/webhook", async (c) => {
	const t = await c.req.json();
	const body = topggSchema.safeParse(t);
	if (!body.success) {
		return c.json({
			error: body.error,
		});
	}

	console.log(`[LOGS] Processing vote for ${body.data.user}`);

	try {
		await processVote(body.data);
	} catch (e: unknown) {
		console.log(`[ERROR] Failed to process vote for ${body.data.user}`);
		if (e instanceof DiscordAPIError && e.stack) {
			const date = new Date();
			const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

			if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");

			fs.writeFileSync(`./logs/${time}_${body.data.user}.txt`, e.stack);
		}

		if (e instanceof Error) {
			console.log(`[ERROR MESSAGE] ${e.message}`);
		}

		return c.json({
			error: "Failed to process vote",
		});
	}

	return c.json({
		success: true,
	});
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});

papr.start(process.env.MONGO_URI!);
