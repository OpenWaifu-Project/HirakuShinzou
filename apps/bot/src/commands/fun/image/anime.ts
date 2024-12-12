import { UserService } from "@repo/database";
import { inject } from "inversify";
import {
	type CommandContext,
	Declare,
	Group,
	Options,
	SubCommand,
	createBooleanOption,
	createNumberOption,
	createStringOption,
} from "seyfert";
import { ImageModels } from "../../../lib/constants";
import { ImageProducer } from "../../../lib/jobs/image/image.producer";
import type { samplers } from "../../../lib/jobs/image/shared";
import { preHandleImageGen } from "../../../lib/scripts/preHandleImageGen";

export const options = {
	content: createStringOption({
		description: "The content (prompt) to use for the image",
		required: true,
	}),
	dimensions: createStringOption({
		description: "Image dimensions",
		required: true,
		choices: [
			{ name: "Portrait", value: "832x1216" },
			{ name: "Portrait (Large)", value: "640x1536" },
			{ name: "Landscape", value: "1216x832" },
			{ name: "Landscape (Large)", value: "1536x640" },
			{ name: "Square", value: "1024x1024" },
		] as const,
	}),
	sampler: createStringOption({
		description: "Sampler to use for the image generation",
		choices: [
			{ name: "Euler", value: "k_euler" },
			{ name: "Euler Ancestral", value: "k_euler_ancestral" },
			{ name: "DPM++ 2S Ancestral", value: "k_dpmpp_2s_ancestral" },
			{ name: "DPM++ 2M", value: "k_dpmpp_2m" },
			{ name: "DPM++ SDE", value: "k_dpmpp_sde" },
		] as const,
		required: false,
	}),
	steps: createNumberOption({
		description: "Steps to use, between 1 and 28, for the image generation (Default: 25)",
		max_value: 28,
		min_value: 1,
		required: false,
	}),
	"undesired-content": createStringOption({
		description: "The undesired-content of the image",
		required: false,
	}),
	"quality-toggle": createBooleanOption({
		description: "Add optional quality tags (Default: true)",
		required: false,
	}),
	"undesired-content-preset": createNumberOption({
		description: "Add optional undesired, for better quality, tags (Default: Light)",
		choices: [
			{ name: "Heavy (Hard Effect)", value: 0 },
			{ name: "Light (Soft Effect)", value: 1 },
			{ name: "None (No effect)", value: 2 },
		] as const,
		required: false,
	}),
	smea: createBooleanOption({
		description: "Activate SMEA for image generation (Default: false)",
		required: false,
	}),
};

@Declare({
	name: "anime",
	description: "Generate an anime image",
})
@Group("image")
@Options(options)
export default class ImageCommand extends SubCommand {
	@inject(ImageProducer) private readonly imageService!: ImageProducer;
	@inject(UserService) private readonly userService!: UserService;

	async run(ctx: CommandContext<typeof options, "prepare">) {
		let prompt = ctx.options.content;
		const dimension = ctx.options.dimensions;
		const sampler = ctx.options.sampler ?? "k_euler_ancestral";
		const negativePrompt = ctx.options["undesired-content"];
		const enhance = ctx.options["quality-toggle"] ?? true;
		const undesiredContentPreset = ctx.options["undesired-content-preset"] ?? 1;
		const smea = ctx.options.smea ?? false;
		const steps = ctx.options.steps ?? 25;

		const userData = ctx.metadata.prepare.user;
		const lang = ctx.metadata.prepare.lang.commands.fun.image;

		const pre = await preHandleImageGen(ctx, prompt, "anime");
		if (typeof pre === "boolean") return;
		prompt = pre;

		const modelInfo = ImageModels.anime;
		await this.userService.updateTokens(ctx.author.id, "image", -(modelInfo.tokensPerUse ?? 1));

		await this.imageService.produceAnimeStyle({
			userId: ctx.author.id,
			channelId: ctx.channelId!,
			type: "generate",
			imageData: {
				prompt,
				negativePrompt,
				width: Number.parseInt(dimension.split("x")[0]),
				height: Number.parseInt(dimension.split("x")[1]),
				SMEA: smea,
				enhance,
				sampler: sampler as keyof typeof samplers,
				undesiredContentPreset,
				steps,
			},
			blur: false,
			guildId: ctx.guildId!,
			model: "anime",
		});

		const { waiting, active } = await this.imageService.getJobCounts("anime");

		const tokens = userData.tokens.image;
		await ctx.editOrReply({
			content: lang.success({
				userId: ctx.author.id,
				tokens: tokens - (modelInfo.tokensPerUse ?? 1),
				position: waiting + active,
				model: "anime",
				dimension,
			}),
		});
	}
}
