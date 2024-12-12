import { GuildService } from "@repo/database";
import { inject } from "inversify";
import { CommandContext, Declare, Group, Options, SubCommand, createStringOption } from "seyfert";

const options = {
	filter: createStringOption({
		description: "Enable/Disable the filter on SFW channels.",
		required: true,
		choices: [
			{ name: "Enabled", value: "on" },
			{ name: "Disabled", value: "off" },
		] as const,
	}),
};

@Declare({
	name: "filter",
	description: "Activate or deactivate the filter in the image module",
})
@Options(options)
@Group("image")
export default class BlurCommand extends SubCommand {
	@inject(GuildService) private readonly guildService!: GuildService;

	async run(ctx: CommandContext<typeof options, "prepare">) {
		const filter = ctx.options.filter;
		const lang = ctx.metadata.prepare.lang.commands.manage.image.filter;

		await this.guildService.updateGuildSettings(ctx.guildId!, {
			imageSettings: {
				filter: filter === "on",
			},
		});

		const statusLang = ctx.metadata.prepare.lang.global[filter];

		await ctx.editOrReply({
			content: lang.success({
				status: statusLang.toLowerCase(),
			}),
		});
	}
}
