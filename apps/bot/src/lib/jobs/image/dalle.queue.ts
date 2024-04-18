import { Process, Processor } from "@repo/bull";
import type { DoneCallback, Job } from "bull";
import { injectable } from "inversify";

@injectable()
@Processor("dalle")
export class DalleQueue {
	@Process()
	public async process(job: Job<DalleJobI>, done: DoneCallback) {
		const { imageData, model } = job.data;
		const { prompt, width, height, style } = imageData;

		const quality = model === "dalle-e-3_HD" ? "hd" : "standard";
		const body = JSON.stringify(
			model === "dall-e-2"
				? {
						model: model,
						prompt,
						size: `${width}x${height}`,
					}
				: {
						model: model.replace("_HD", ""),
						prompt,
						size: `${width}x${height}`,
						quality: model === "dall-e-2" ? null : quality,
						style: model === "dall-e-2" ? null : style ?? "vivid",
					}
		);
		const data = await fetch("https://api.openai.com/v1/images/generations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
			body: body,
		});

		if (!data.ok) {
			const dataJSON = await data.json();
			console.error(JSON.stringify(dataJSON, null, 2));
			done(new Error(dataJSON.error.message));
		}

		const dataJSON = await data.json();

		if (!dataJSON.data) {
			done(new Error("Couldn't fetch image"));
		}

		const imageUrlData = await fetch(dataJSON.data[0].url);
		done(null, Buffer.from(await imageUrlData.arrayBuffer()));
	}
}

export interface DalleJobI {
	channelId: string;
	guildId: string;
	userId: string;
	blur: boolean;
	model: string;
	type: "generate";
	imageData: {
		prompt: string;
		style: "vivid" | "natural";
		width: number;
		height: number;
	};
}
