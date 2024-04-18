import { CommandContext, Declare, Options, SubCommand, createStringOption } from "seyfert";
import { inject } from "inversify";
import { UserService } from "@repo/database";

const options = {
	prompt: createStringOption({
		description: "The prompt for the tag you use.",
		required: true,
	}),
};

@Declare({
	name: "delete-tag",
	description: "Delete a image generation custom tag",
})
@Options(options)
export default class CreateTagCommand extends SubCommand {
	@inject(UserService) private readonly userService!: UserService;
	async run(ctx: CommandContext<typeof options, "prepare">) {
		const prompt = ctx.options.prompt;
		const userDat = ctx.metadata.prepare.user;

		const lang = ctx.metadata.prepare.lang.commands.util;

		if (userDat.imageTags.find((tag) => tag.prompt === prompt)) {
			await this.userService.deleteTag(ctx.author.id, prompt);

			return ctx.editOrReply({
				content: lang.deleteTag.success,
			});
		}

		return ctx.editOrReply({
			content: lang.deleteTag.notFound,
		});
	}
}
