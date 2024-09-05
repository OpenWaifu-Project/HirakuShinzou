import { UserService } from "@repo/database";
import {
	CommandContext,
	Declare,
	Options,
	SubCommand,
	createIntegerOption,
	createStringOption,
	createUserOption,
} from "seyfert";
import { inject } from "inversify";

const options = {
	user: createUserOption({
		required: true,
		description: "The user to give/take tokens to",
	}),
	type: createStringOption({
		required: true,
		description: "The type of tokens to give/take",
		choices: [
			{
				name: "Image",
				value: "image",
			},
			{
				name: "Chat",
				value: "chat",
			},
		] as const,
	}),
	amount: createIntegerOption({
		required: true,
		description: "The amount of tokens to give/take",
	}),
};

@Declare({
	name: "give",
	description: "Give/take tokens to/from a user",
})
@Options(options)
export default class GiveCommand extends SubCommand {
	@inject(UserService) private readonly userService!: UserService;
	async run(ctx: CommandContext<typeof options>) {
		const user = ctx.options.user.id;
		const type = ctx.options.type;
		const amount = ctx.options.amount;

		await this.userService.updateTokens(user, type, amount);

		await ctx.deferReply(true);
		await ctx.editOrReply({
			content: `${amount > 0 ? "Gave" : "Taken"} ${amount} ${type} tokens ${amount > 0 ? "to" : "from"} <@${user}>`,
		});
	}
}
