import { UserService } from "@repo/database";
import { inject } from "inversify";
import { CommandContext, Declare, Group, Options, SubCommand, createStringOption } from "seyfert";
import { ImageModels } from "../../../lib/constants";
import { ImageProducer } from "../../../lib/jobs/image/image.producer";
import { preHandleImageGen } from "../../../lib/scripts/preHandleImageGen";

export const options = {
	content: createStringOption({
		description: "The content (prompt) to use for the image",
		required: true,
	}),
	model: createStringOption({
		description: "Model to use",
		required: true,
		choices: [
			{
				name: "Dall-E 2",
				value: "dall-e-2",
			},

			{
				name: "Dall-E 3",
				value: "dall-e-3",
			},
			{
				name: "Dall-E 3 HD",
				value: "dall-e-3_HD",
			},
		] as const,
	}),
	style: createStringOption({
		description: "Style of the generated images (Dall-E 3 Only)",
		required: false,
		choices: [
			{ name: "Vivid (more hyper-real and dramatic images)", value: "vivid" },
			{ name: "Natural (more natural, less hyper-real looking images)", value: "natural" },
		] as const,
	}),
};

@Declare({
	name: "dalle",
	description: "Generate a dalle image",
})
@Group("image")
@Options(options)
export default class ImageCommand extends SubCommand {
	@inject(ImageProducer) private readonly imageService!: ImageProducer;
	@inject(UserService) private readonly userService!: UserService;

	async run(ctx: CommandContext<typeof options, "prepare">) {
		let prompt = ctx.options.content;
		const model = ctx.options.model;
		const style = ctx.options.style ?? "vivid";

		const userData = ctx.metadata.prepare.user;
		const lang = ctx.metadata.prepare.lang.commands.fun.image;

		const pre = await preHandleImageGen(ctx, prompt, model);
		if (typeof pre === "boolean") return;
		prompt = pre;

		const modelInfo = ImageModels[model];
		await this.userService.updateTokens(ctx.author.id, "image", -(modelInfo.tokensPerUse ?? 1));

		await this.imageService.produceDalle({
			userId: ctx.author.id,
			channelId: ctx.channelId,
			type: "generate",
			imageData: {
				prompt,
				style,
				width: model === "dall-e-2" ? 512 : 1024,
				height: model === "dall-e-2" ? 512 : 1024,
			},
			blur: false,
			guildId: ctx.guildId!,
			model,
		});

		const { waiting, active } = await this.imageService.getJobCounts("dalle");

		const tokens = userData.tokens.image;
		await ctx.editOrReply({
			content: lang.success({
				userId: ctx.author.id,
				tokens: tokens - (modelInfo.tokensPerUse ?? 1),
				position: waiting + active,
				model,
				dimension: "1024x1024",
			}),
		});
	}
}
