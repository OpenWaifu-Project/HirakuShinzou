import { Declare, AutoLoad, Middlewares, Command, type CommandContext } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";

@Declare({
	name: "dev",
	description: "Dev commands",
	contexts: ["GUILD"],
})
@AutoLoad()
@Middlewares(["devOnly", "prepare"])
export default class DevCommand extends Command {
	onMiddlewaresError(context: CommandContext, error: string) {
		context.editOrReply({
			content: `**Error**: ${error}`,
			flags: MessageFlags.Ephemeral,
		});
	}
}
