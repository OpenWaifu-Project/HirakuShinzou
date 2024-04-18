import { CommandContext, Declare, SubCommand } from "seyfert";

@Declare({
	name: "vote",
	description: "get link to vote for the bot",
})
export default class VoteCommand extends SubCommand {
	async run(ctx: CommandContext) {
		await ctx.editOrReply({
			content: "Vote for Hiraku here: https://top.gg/bot/1095572785482444860/vote",
		});
	}
}
