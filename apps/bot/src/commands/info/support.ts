import { CommandContext, Declare, SubCommand } from "seyfert";

@Declare({
	name: "support",
	description: "View support server invite link",
})
export default class PingCommand extends SubCommand {
	async run(ctx: CommandContext<never, "prepare">) {
		const { lang } = ctx.metadata.prepare;
		await ctx.editOrReply({
			content: lang.commands.info.support.success,
		});
	}
}
