import { Process, Processor } from "@repo/bull";
import { injectable } from "inversify";
import { DoneCallback, Job } from "bull";
import { constants } from "../../constants";
import { samplers } from "./shared";

const enhancePrompt = "best quality, amazing quality, very aesthetic, absurdres, ";
const possibleNegativeTags = {
	0: "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract], ",
	1: "nsfw, lowres, jpeg artifacts, worst quality, watermark, blurry, very displeasing, ",
	2: "",
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

@injectable()
@Processor("prodia")
export class ProdiaQueue {
	@Process()
	public async process(job: Job<ProdiaJobI>, done: DoneCallback) {
		const { imageData, model } = job.data;
		const { prompt, negativePrompt, width, height, enhance, sampler, undesiredContentPreset, steps } = imageData;

		const selectedSampler = sampler ? samplers[sampler] : "k_euler_ancestral";

		const data = await fetch(`${constants.IMAGE_CREATE_APIS.PRODIA_API_URL}/v1/sdxl/generate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Prodia-Key": `${process.env.PRODIA_API_KEY}`,
			},
			body: JSON.stringify({
				model,
				prompt: `${enhance ? enhancePrompt : ""}${prompt}`,
				negative_prompt: `${
					possibleNegativeTags[undesiredContentPreset as keyof typeof possibleNegativeTags]
				}${negativePrompt}`,
				steps: steps,
				cfg_scale: 7,
				sampler: selectedSampler,
				width: width,
				height: height,
				seed: -1,
			}),
		});

		if (!data.ok) {
			done(new Error("Couldn't fetch image"));
		}

		const ImageData = (await data.json()) as { job: string; status: string };

		for (let i = 0; i < 6; i++) {
			await delay(5000);
			const jobData = await this.checkProdiaJob(ImageData.job);
			if (!jobData) continue;
			return done(null, jobData);
		}

		return done(new Error("Image could not be obtained after 5 attempts (30~ secs)"));
	}

	async checkProdiaJob(jobId: string) {
		const data = await fetch(`${constants.IMAGE_CREATE_APIS.PRODIA_API_URL}/v1/job/${jobId}`, {
			headers: {
				"Content-Type": "application/json",
				"X-Prodia-Key": `${process.env.PRODIA_API_KEY}`,
			},
		}).catch((e) => console.error(e));

		if (!data?.ok) {
			console.error(data);
			return data?.statusText ?? "Unknown error";
		}

		const fetchedObject = (await data.json()) as {
			job: string;
			status: string;
			imageUrl: string;
		};

		if (fetchedObject.status === "succeeded") {
			const data = await fetch(fetchedObject.imageUrl);
			return Buffer.from(await data.arrayBuffer());
		}

		return null;
	}
}

export interface ProdiaJobI {
	channelId: string;
	guildId: string;
	userId: string;
	blur: boolean;
	model: string;
	type: "generate";
	imageData: {
		prompt: string;
		negativePrompt?: string;
		width: number;
		height: number;
		enhance: boolean;
		sampler: keyof typeof samplers;
		undesiredContentPreset: number;
		steps: number;
	};
}
