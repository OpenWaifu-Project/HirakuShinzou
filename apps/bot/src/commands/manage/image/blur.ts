import { CommandContext, Declare, Group, Options, SubCommand, createStringOption } from "seyfert";
import { GuildService } from "@repo/database";
import { inject } from "inversify";

const options = {
	status: createStringOption({
		description: "The status to set",
		required: true,
		choices: [
			{ name: "Enabled", value: "on" },
			{ name: "Disabled", value: "off" },
		],
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
		const status = ctx.options.status as "on" | "off";
		const lang = ctx.metadata.prepare.lang.commands.manage.image.blur;

		await this.guildService.update(ctx.guildId!, {
			$set: {
				"settings.image.blur": status === "on",
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
