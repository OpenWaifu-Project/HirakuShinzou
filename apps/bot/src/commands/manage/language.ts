import { GuildService } from "@repo/database";
import { inject } from "inversify";
import { CommandContext, Declare, Options, SubCommand, createStringOption } from "seyfert";

const options = {
	lang: createStringOption({
		description: "The language to set",
		required: true,
		choices: [
			{ name: "English", value: "en" },
			{ name: "Spanish", value: "es" },
		] as const,
	}),
};

@Declare({
	description: "Manage the bot language",
	name: "language",
})
@Options(options)
export default class LanguageCommand extends SubCommand {
	@inject(GuildService) private readonly guildService!: GuildService;

	async run(ctx: CommandContext<typeof options>) {
		const language = ctx.options.lang;
		const lang = ctx.t.get(language);

		await this.guildService.updateGuildSettings(ctx.guildId!, {
			language,
		});

		await ctx.editOrReply({
			content: lang.commands.manage.language.success({ language }),
		});
	}
}
