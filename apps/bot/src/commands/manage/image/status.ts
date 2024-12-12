import { GuildService } from "@repo/database";
import { inject } from "inversify";
import { CommandContext, Declare, Group, Options, SubCommand, createStringOption } from "seyfert";

const option = {
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
	name: "status",
	description: "Set the status for the image module",
})
@Options(option)
@Group("image")
export default class StatusCommand extends SubCommand {
	@inject(GuildService) private readonly guildService!: GuildService;

	async run(ctx: CommandContext<typeof option, "prepare">) {
		const status = ctx.options.status;
		const lang = ctx.metadata.prepare.lang.commands.manage.image.status;

		await this.guildService.updateGuildSettings(ctx.guildId!, {
			imageSettings: {
				status: status === "on",
			},
		});

		await ctx.editOrReply({
			content: lang.success({
				status: ctx.metadata.prepare.lang.global[status],
			}),
		});
	}
}
