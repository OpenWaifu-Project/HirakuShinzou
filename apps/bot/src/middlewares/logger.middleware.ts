import { createMiddleware } from "seyfert";
import { bold } from "seyfert/lib/common";
export const loggerMiddleware = createMiddleware<void>((middle) => {
	if (!middle.context.isChat()) return middle.next();

	middle.context.client.logger.info(
		`${middle.context.author.username} (${middle.context.author.id}) [guildId: ${
			middle.context.interaction.guildId
		}] ran /${bold(middle.context.resolver.fullCommandName)}`
	);
	middle.next();
});
