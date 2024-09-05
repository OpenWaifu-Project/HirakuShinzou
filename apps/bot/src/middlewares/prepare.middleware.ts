import { CommandContext, createMiddleware } from "seyfert";
import { inject, injectable } from "inversify";
import { GuildService, UserService } from "@repo/database";

interface PrepareContext {
	guild: NonNullable<Awaited<ReturnType<typeof GuildService.prototype.get>>>;
	user: NonNullable<Awaited<ReturnType<typeof UserService.prototype.get>>>;
	lang: ReturnType<CommandContext["t"]["get"]>;
}

@injectable()
export class prepareMiddleware {
	@inject(GuildService) private readonly guildService!: GuildService;
	@inject(UserService) private readonly userService!: UserService;

	public middleware = createMiddleware<PrepareContext>(async (middle) => {
		await middle.context.interaction.deferReply();

		const guild = await this.guildService.get(middle.context.interaction.guildId!);
		const user = await this.userService.get(middle.context.interaction.user.id);

		middle.next({
			guild: guild,
			user: user,
			lang: middle.context.t.get(guild.language ?? "en"),
		});
	});
}
