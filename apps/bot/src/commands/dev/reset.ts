import { inject } from "inversify";
import { CommandContext, Declare, SubCommand } from "seyfert";
import { RedisClient } from "../../lib/structures/redis";

@Declare({
	name: "resetdev",
	description: "Reset chatbot history (dev)",
})
export default class ResetDevCommand extends SubCommand {
	@inject(RedisClient) private readonly redis!: RedisClient;

	async run(ctx: CommandContext<never, "prepare">) {
		if (!ctx.guildId) return;

		await this.redis.del(`chat:${ctx.guildId}`);
		await ctx.editOrReply({
			content: ctx.metadata.prepare.lang.commands.manage.chat.reset.success,
		});
	}
}
