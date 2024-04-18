import { CommandContext, Declare, Group, Options, SubCommand, createStringOption } from "seyfert";
import { inject } from "inversify";
import { GuildService } from "@repo/database";

const option = {
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
	name: "status",
	description: "Set the status for the image module",
})
@Options(option)
@Group("image")
export default class StatusCommand extends SubCommand {
	@inject(GuildService) private readonly guildService!: GuildService;

	async run(ctx: CommandContext<typeof option, "prepare">) {
		const status = ctx.options.status as "on" | "off";
		const lang = ctx.metadata.prepare.lang.commands.manage.image.status;

		await this.guildService.update(ctx.interaction.guildId!, {
			$set: {
				"settings.image.status": status === "on",
			},
		});

		await ctx.editOrReply({
			content: lang.success({
				status: ctx.metadata.prepare.lang.global[status],
			}),
		});
	}
}
