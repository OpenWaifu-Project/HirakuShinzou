import { CommandContext, Declare, Group, Options, SubCommand, createChannelOption, createStringOption } from "seyfert";
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
	channel: createChannelOption({
		description: "The channel to set",
		required: false,
	}),
};

@Declare({
	name: "channel",
	description: "Set the channel for the image module",
})
@Options(option)
@Group("image")
export default class ChannelCommand extends SubCommand {
	@inject(GuildService) private readonly guildService!: GuildService;

	async run(ctx: CommandContext<typeof option, "prepare">) {
		const channel = ctx.options.channel;
		const status = ctx.options.status as "on" | "off";
		const lang = ctx.metadata.prepare.lang.commands.manage.image.channel;
		if (status === "on" && !channel) {
			return await ctx.editOrReply({
				content: lang.missingChannel,
			});
		}

		await this.guildService.update(ctx.interaction.guildId!, {
			$set: {
				"settings.image.channel": channel ? channel.id : null,
			},
		});

		if (status === "off") {
			return await ctx.editOrReply({
				content: lang.disabled,
			});
		}

		await ctx.editOrReply({
			content: lang.success({
				channel: channel?.id || ctx.metadata.prepare.lang.global.none,
			}),
		});
	}
}
