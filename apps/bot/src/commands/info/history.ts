import { ImageHistoryService } from "@repo/database";
import { inject } from "inversify";
import moment from "moment";
import { type CommandContext, Declare, Options, SubCommand, createNumberOption, createStringOption } from "seyfert";
import { ActionRow, Button, Embed } from "seyfert/lib/builders";
import { ButtonStyle } from "seyfert/lib/types";
import { ImageModels } from "../../lib/constants";

const choices = (Object.keys(ImageModels) as (keyof typeof ImageModels)[]).map((key) => ({
	name: ImageModels[key].name,
	value: ImageModels[key].name,
}));

const options = {
	page: createNumberOption({
		description: "The page to view",
		required: false,
	}),
	prompt: createStringOption({
		description: "The prompt to filter by",
		required: false,
	}),
	model: createStringOption({
		description: "The type to filter by",
		required: false,
		choices,
	}),
	type: createStringOption({
		description: "The type to filter by",
		required: false,
		choices: [
			{ name: "Generate", value: "generate" },
			{ name: "Image to Image", value: "img2img" },
		] as const,
	}),
};

@Declare({
	name: "history",
	description: "History of your generated images",
})
@Options(options)
export default class HistoryCommand extends SubCommand {
	@inject(ImageHistoryService) private readonly imageHistoryModel!: ImageHistoryService;

	async run(context: CommandContext<typeof options, "prepare">) {
		let pageInput = context.options.page || 1;
		const prompt = context.options.prompt?.split("|").map((p) => p.trim());

		const images = await this.imageHistoryModel.filterByUser(context.author.id, {
			prompt,
			model: context.options.model,
			genType: context.options.type,
		});

		if (!images.length) {
			return context.editOrReply({
				content: context.metadata.prepare.lang.commands.info.history.noImages,
			});
		}

		const genEmbed = () => {
			// biome-ignore lint/suspicious/noAssignInExpressions: Looks cute
			const currentImage = images.at(pageInput - 1) ?? images[(pageInput = 0)];
			const embed = new Embed()
				.setThumbnail(context.author.avatarURL())
				.setColor(4405450)
				.setDescription(
					[
						`> **Prompt**: ${currentImage.prompt}`,
						// `> **Negative Prompt**: ${currentImage.negativePrompt}`,
						`> **Resolution**: ${currentImage.width}x${currentImage.height}`,
						`> **Date**: ${moment(currentImage.createdAt).format("YYYY-MM-DD HH:mm:ss")}`,
						`> **Type**: ${currentImage.genType ?? "Generate"}`,
						`> **Model**: ${currentImage.model ?? "None"}`,
						currentImage.negativePrompt ? `> **Negative Prompt**: ${currentImage.negativePrompt}` : "",
					].join("\n")
				)
				.setImage(currentImage.url)
				.setFooter({
					text: `Page ${images.indexOf(currentImage) + 1} of ${images.length}`,
				});

			return embed;
		};
		const actionRow = new ActionRow<Button>().addComponents(
			new Button().setCustomId("previous").setEmoji("◀").setStyle(ButtonStyle.Primary),
			new Button().setCustomId(`delete-${pageInput}`).setEmoji("🗑").setStyle(ButtonStyle.Danger),
			new Button().setCustomId("next").setEmoji("▶").setStyle(ButtonStyle.Primary)
		);

		const res = await context.editOrReply(
			{
				embeds: [genEmbed()],
				components: [actionRow],
			},
			true
		);

		const collector = res.createComponentCollector({
			filter: (i) => i.user.id === context.author.id,
			idle: 3000 * 10,
		});

		collector.run("next", (i) => {
			pageInput++;
			i.update({
				embeds: [genEmbed()],
			});
		});

		collector.run("previous", (i) => {
			pageInput--;
			i.update({
				embeds: [genEmbed()],
			});
		});

		collector.run(/^delete-\d+$/, (i) => {
			const page = Number.parseInt(i.customId.split("-")[1]);
			const image = images.at(page - 1) ?? images[0];

			this.imageHistoryModel.delete(image._id);
			images.splice(images.indexOf(image), 1);

			i.update({
				embeds: [genEmbed()],
			});
		});
	}
}
