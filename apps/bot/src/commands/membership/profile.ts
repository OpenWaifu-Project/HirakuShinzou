import { CommandContext, Declare, SubCommand } from "seyfert";
import { Embed } from "seyfert/lib/builders";

@Declare({
	name: "profile",
	description: "View your profile (token count, stats, etc)",
})
export default class ProfileCommand extends SubCommand {
	run(ctx: CommandContext<never, "prepare">) {
		const { user } = ctx.metadata.prepare;
		const lang = ctx.metadata.prepare.lang.commands.membership;

		const embed = new Embed()
			.setThumbnail(ctx.author.avatarURL())
			.setTitle(`${ctx.author.username}'s Profile`)
			.setDescription(
				[
					"**General**",
					`> **Plan**: ${user.membership.plan}`,
					`> **${lang.profile.lastClaimed}**: ${new Date(user.lastVote).toLocaleString()}`,
					`> **${lang.profile.voteStrike}**: ${user.voteStreak}`,
					`**${lang.profile.imageStats}**`,
					`> **Tokens**: ${user.tokens.image < 0 ? "∞" : user.tokens.image}`,
					`> **${lang.profile.totalImages}**: ${user.imageHistory?.length}`,
					`**${lang.profile.chatStats}**`,
					`> **Tokens**: ${user.tokens.chat < 0 ? "∞" : user.tokens.chat}`,
				].join("\n")
			)
			.setColor(4405450)
			.setImage("https://i.imgur.com/S7fnh3X.png");

		ctx.editOrReply({
			embeds: [embed],
		});
	}
}
