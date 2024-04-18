import { CommandContext, Declare, Options, SubCommand, createBooleanOption } from "seyfert";
import { UserService } from "@repo/database";
import { inject } from "inversify";

const options = {
	history: createBooleanOption({
		description: "Track your image generation history",
		required: false,
	}),
};

@Declare({
	name: "config",
	description: "Change your profile config",
})
@Options(options)
export default class ConfigCommand extends SubCommand {
	@inject(UserService) private readonly userService!: UserService;
	async run(ctx: CommandContext<typeof options, "prepare">) {
		const lang = ctx.metadata.prepare.lang.commands.util;
		const history = ctx.options.history ?? false;

		await this.userService.update(ctx.author.id, {
			$set: {
				"settings.history": history,
			},
		});

		return ctx.editOrReply({
			content: lang.config.success,
		});
	}
}
