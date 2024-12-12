import { GuildService } from "@repo/database";
import { inject } from "inversify";
import { CommandContext, Declare, Group, Options, SubCommand, createChannelOption, createStringOption } from "seyfert";

const option = {
	status: createStringOption({
		description: "The status to set",
		required: true,
		choices: [
			{ name: "Enabled", value: "on" },
			{ name: "Disabled", value: "off" },
		] as const,
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
		const status = ctx.options.status;
		const lang = ctx.metadata.prepare.lang.commands.manage.image.channel;
		if (status === "on" && !channel) {
			return await ctx.editOrReply({
				content: lang.missingChannel,
			});
		}

		await this.guildService.updateGuildSettings(ctx.guildId!, {
			imageSettings: {
				channel: channel ? channel.id : null,
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
