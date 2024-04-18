import { CommandContext, Declare, Options, SubCommand, createStringOption, createUserOption } from "seyfert";
import { constants } from "../../lib/constants";
import { inject } from "inversify";
import { UserService } from "@repo/database";

const options = {
	user: createUserOption({
		required: true,
		description: "The user to set the membership of",
	}),
	membership: createStringOption({
		description: "The membership to set the user to",
		required: true,
		choices: [
			{
				name: "Free",
				value: "Free",
			},
		],
	}),
};

@Declare({
	name: "set-membership",
	description: "Set the membership of a user",
})
@Options(options)
export default class SetMembershipCommand extends SubCommand {
	@inject(UserService) private readonly userService!: UserService;

	async run(ctx: CommandContext<typeof options>) {
		const user = ctx.options.user.id;
		const membership = ctx.options.membership;

		const membershipData = constants.MEMBERSHIPS[membership as keyof typeof constants.MEMBERSHIPS];

		await this.userService.update(user, {
			$set: {
				"membership.plan": membership,
				"membership.since": Date.now(),
			},
			$inc: {
				"tokens.image": membershipData.imageTokens,
				"tokens.chat": membershipData.chatTokens,
			},
		});

		await ctx.editOrReply({
			content: `Set membership of <@${user}> to ${membership}`,
		});
	}
}
