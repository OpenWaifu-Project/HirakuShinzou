import { Process, Processor } from "@repo/bull";
import { injectable } from "inversify";
import { DoneCallback, Job } from "bull";
import { constants } from "../../constants";
import admzip from "adm-zip";
import { samplers } from "./shared";
const enhancePrompt = "best quality, amazing quality, very aesthetic, absurdres, ";
const possibleNegativeTags = {
	0: "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract], ",
	1: "nsfw, lowres, jpeg artifacts, worst quality, watermark, blurry, very displeasing, ",
	2: "",
};

@injectable()
@Processor("anime")
export class AnimeQueue {
	@Process()
	public async process(job: Job<AnimeJobI>, done: DoneCallback) {
		const { imageData, type } = job.data;
		const { prompt, negativePrompt, width, height, enhance, sampler, undesiredContentPreset, steps, SMEA } = imageData;
		const minSeed = 1000000000;
		const maxSeed = 9999999999;
		const randomSeed = Math.floor(Math.random() * (maxSeed - minSeed)) + minSeed;

		const data = await fetch(`${constants.IMAGE_CREATE_APIS.ANIME_API_URL}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${process.env.ANIME_API_TOKEN}`,
			},
			body: JSON.stringify({
				input: `${enhance ? enhancePrompt : ""}${prompt}`,
				model: process.env.ANIME_API_MODEL,
				action: type,
				parameters: {
					// Regular image gen params
					scale: 5,
					sampler: sampler,
					steps: steps,
					n_samples: 1,
					ucPreset: 0,
					sm: SMEA,
					sm_dyn: SMEA,
					dynamic_thresholding: false,
					controlnet_strength: 1,
					add_original_image: false,
					uncond_scale: 1,
					cfg_rescale: 0,
					width: width,
					height: height,
					negative_prompt: `${
						possibleNegativeTags[undesiredContentPreset as keyof typeof possibleNegativeTags]
					}${negativePrompt}`,
					seed: randomSeed,
					// TODO: img2img support
					// ...(type === "img2img" && {
					// 	strength: 0.7,
					// 	noise: 0,
					// 	extra_noise_seed: randomSeed,
					// 	image: `${image.rawImage?.data ?? ""}`
					// })
				},
			}),
		});

		if (!data.ok) {
			done(new Error("Failed to fetch from anime API"));
			return;
		}

		const zip = new admzip(Buffer.from(await data.arrayBuffer()));
		const image = zip.getEntries()[0].getData();

		done(null, image);
	}
}

export interface AnimeJobI {
	type: "generate" | "img2img";
	channelId: string;
	guildId: string;
	userId: string;
	blur: boolean;
	model: string;

	imageData: {
		prompt: string;
		negativePrompt?: string;
		width: number;
		height: number;
		enhance: boolean;
		sampler: keyof typeof samplers;
		undesiredContentPreset: number;
		steps: number;
		SMEA?: boolean;
		// rawImage?: {
		// 	data: string;
		// };
		strength?: number;
		noise?: number;
	};
}
