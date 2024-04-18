import { AutoLoad, Command, type CommandContext, Declare, Groups, Middlewares } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

@Declare({
	name: "fun",
	description: "Many of fun commands",
	contexts: ["GUILD"],
})
@Groups({
	image: {
		name: [["en-US", "image"]],
		description: [["en-US", "Image generation related commands"]],
		defaultDescription: "Image generation related commands",
	},
})
@AutoLoad()
@Middlewares(["prepare"])
export default class FunCommand extends Command {
	async onMiddlewaresError(context: CommandContext, error: string) {
		await context.editOrReply({
			content: error,
			flags: MessageFlags.Ephemeral,
		});
	}
}
