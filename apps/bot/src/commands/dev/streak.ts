import { UserService } from "@repo/database";
import { CommandContext, Declare, Options, SubCommand, createIntegerOption, createUserOption } from "seyfert";
import { inject } from "inversify";

const options = {
	user: createUserOption({
		required: true,
		description: "The user to give/take tokens to",
	}),
	amount: createIntegerOption({
		required: true,
		description: "The amount of tokens to give/take",
	}),
};

@Declare({
	name: "streak",
	description: "Set vote streak for a user",
})
@Options(options)
export default class StreakCommand extends SubCommand {
	@inject(UserService) private readonly userService!: UserService;
	async run(ctx: CommandContext<typeof options>) {
		const user = ctx.options.user.id;
		const amount = ctx.options.amount;

		await this.userService.updateUser(user, {
			voteStreak: amount,
			lastVote: Date.now(),
		});

		await ctx.editOrReply({
			content: `Set vote streak to ${amount} for <@${user}>`,
		});
	}
}
