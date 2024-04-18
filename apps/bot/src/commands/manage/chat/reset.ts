import { inject } from "inversify";
import { CommandContext, Declare, Group, SubCommand } from "seyfert";
import { RedisClient } from "../../../lib/structures/redis";

@Declare({
	name: "reset",
	description: "Reset chatbot history",
})
@Group("chat")
export default class ResetCommand extends SubCommand {
	@inject(RedisClient) private readonly redis!: RedisClient;

	async run(ctx: CommandContext<never, "prepare">) {
		if (!ctx.guildId) return;

		await this.redis.del(`chat:${ctx.guildId}`);

		await ctx.editOrReply({
			content: ctx.metadata.prepare.lang.commands.manage.chat.reset.success,
		});
	}
}
