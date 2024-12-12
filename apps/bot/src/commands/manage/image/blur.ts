import { GuildService } from "@repo/database";
import { inject } from "inversify";
import { CommandContext, Declare, Group, Options, SubCommand, createStringOption } from "seyfert";

const options = {
	status: createStringOption({
		description: "The status to set",
		required: true,
		choices: [
			{ name: "Enabled", value: "on" },
			{ name: "Disabled", value: "off" },
		] as const,
	}),
};

@Declare({
	name: "blur",
	description: "Activate or deactivate the blur in the image module",
})
@Options(options)
@Group("image")
export default class BlurCommand extends SubCommand {
	@inject(GuildService) private readonly guildService!: GuildService;

	async run(ctx: CommandContext<typeof options, "prepare">) {
		const status = ctx.options.status;
		const lang = ctx.metadata.prepare.lang.commands.manage.image.blur;

		await this.guildService.updateGuildSettings(ctx.guildId!, {
			imageSettings: {
				blur: status === "on",
			},
		});

		const statusLang = ctx.metadata.prepare.lang.global[status];

		await ctx.editOrReply({
			content: lang.success({
				status: statusLang.toLowerCase(),
			}),
		});
	}
}
