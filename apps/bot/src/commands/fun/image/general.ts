import { UserService } from "@repo/database";
import { inject } from "inversify";
import {
	CommandContext,
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
import { samplers } from "../../../lib/jobs/image/shared";
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
			{ name: "Portrait", value: "768x1024" },
			{ name: "Landscape", value: "1024x768" },
			{ name: "Square", value: "1024x1024" },
		] as const,
	}),
	model: createStringOption({
		description: "Model to use for the image generation",
		required: true,
		choices: [
			{
				name: "TurboVisionXL (General use)",
				value: "turbovisionXL_v431.safetensors [78890989]",
			},
			{
				name: "Animagine XL (Anime style)",
				value: "animagineXLV3_v30.safetensors [75f2f05b]",
			},
			{ name: "RealVisXL (Photorealism)", value: "realvisxlV40.safetensors [f7fdcb51]" },
			{
				name: "DynaVision XL (Stylized 3D)",
				value: "dynavisionXL_0411.safetensors [c39cc051]",
			},
		] as const,
	}),
	sampler: createStringOption({
		description: "Sampler to use for the image generation",
		choices: [
			{ name: "Euler", value: "Euler" },
			{ name: "Euler Ancestral", value: "Euler a" },
			{ name: "DPM++ 2S Ancestral", value: "DPM++ 2S a" },
			{ name: "DPM++ 2M", value: "DPM++ 2M" },
			{ name: "DPM++ SDE", value: "DPM++ SDE" },
			{ name: "DPM2 Karras", value: "DPM2 Karras" },
			{ name: "DDIM", value: "DDIM" },
		] as const,
		required: false,
	}),
	steps: createNumberOption({
		description: "Steps to use, between 1 and 25, for the image generation (Default: 25)",
		max_value: 25,
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
};

@Declare({
	name: "general",
	description: "Generate an image with various types of style",
})
@Group("image")
@Options(options)
export default class ImageCommand extends SubCommand {
	@inject(ImageProducer) private readonly imageService!: ImageProducer;
	@inject(UserService) private readonly userService!: UserService;

	async run(ctx: CommandContext<typeof options, "prepare">) {
		let prompt = ctx.options.content;
		const dimension = ctx.options.dimensions;
		const model = ctx.options.model as
			| "turbovisionXL_v431.safetensors [78890989]"
			| "dynavisionXL_0411.safetensors [c39cc051]"
			| "realvisxlV40.safetensors [f7fdcb51]"
			| "animagineXLV3_v30.safetensors [75f2f05b]";
		const sampler = ctx.options.sampler ?? "Euler a";
		const steps = ctx.options.steps ?? 25;
		const negativePrompt = ctx.options["undesired-content"];
		const enhance = ctx.options["quality-toggle"] ?? true;
		const undesiredContentPreset = ctx.options["undesired-content-preset"] ?? 1;

		const userData = ctx.metadata.prepare.user;
		const lang = ctx.metadata.prepare.lang.commands.fun.image;

		const pre = await preHandleImageGen(ctx, prompt, model);
		if (typeof pre === "boolean") return;
		prompt = pre;

		const modelInfo = ImageModels[model];
		await this.userService.updateTokens(ctx.author.id, "image", -(modelInfo.tokensPerUse ?? 1));

		await this.imageService.produceProdia({
			userId: ctx.author.id,
			channelId: ctx.channelId,
			type: "generate",
			imageData: {
				prompt,
				negativePrompt,
				width: Number.parseInt(dimension.split("x")[0]),
				height: Number.parseInt(dimension.split("x")[1]),
				enhance,
				sampler: sampler as keyof typeof samplers,
				undesiredContentPreset,
				steps,
			},
			blur: false,
			guildId: ctx.guildId!,
			model,
		});

		const { waiting, active } = await this.imageService.getJobCounts("prodia");

		const tokens = userData.tokens.image;
		await ctx.editOrReply({
			content: lang.success({
				userId: ctx.author.id,
				tokens: tokens - (modelInfo.tokensPerUse ?? 1),
				position: waiting + active,
				model,
				dimension,
			}),
		});
	}
}
