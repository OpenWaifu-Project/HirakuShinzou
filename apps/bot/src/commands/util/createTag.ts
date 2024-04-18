import { type CommandContext, Declare, Options, SubCommand, createStringOption } from "seyfert";
import { UserService } from "@repo/database";
import { inject } from "inversify";
import { ActionRow, Button } from "seyfert/lib/builders";
import { ButtonStyle } from "seyfert/lib/types";

const options = {
	prompt: createStringOption({
		description: "The prompt for the tag Ex. Hiraku",
		required: true,
	}),
	tags: createStringOption({
		description: "The tags for the prompt. Ex. 1girl, blue hair, etc",
		required: true,
	}),
};

@Declare({
	name: "create-tag",
	description: "Create a image generation custom tag",
})
@Options(options)
export default class CreateTagCommand extends SubCommand {
	@inject(UserService) private readonly userService!: UserService;
	async run(ctx: CommandContext<typeof options, "prepare">) {
		const prompt = ctx.options.prompt;
		const tags = ctx.options.tags;
		const userDat = ctx.metadata.prepare.user;

		const lang = ctx.metadata.prepare.lang.commands.util;
		if (userDat.imageTags.find((tag) => tag.prompt === prompt)) {
			const actionRow = new ActionRow<Button>().addComponents(
				new Button().setCustomId("confirm").setLabel("✅").setStyle(ButtonStyle.Success),
				new Button().setCustomId("cancel").setLabel("❌").setStyle(ButtonStyle.Danger)
			);

			const res = await ctx.editOrReply(
				{
					content: lang.createTag.existingTag,
					components: [actionRow],
				},
				true
			);

			const collector = res.createComponentCollector({
				filter: (i) => i.user.id === ctx.author.id,
				idle: 3000 * 10,
			});

			collector.run("confirm", (i) => {
				i.update({
					content: lang.createTag.successUpdate,
					components: [],
				});
			});

			collector.run("cancel", (i) => {
				i.update({
					content: lang.createTag.failed,
					components: [],
				});
			});

			return;
		}

		await this.userService.createTag(ctx.author.id, prompt, tags);

		return ctx.editOrReply({
			content: lang.createTag.successCreate,
		});
	}
}
