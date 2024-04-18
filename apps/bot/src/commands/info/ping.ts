import { type CommandContext, Declare, SubCommand } from "seyfert";
import { Button, ActionRow } from "seyfert/lib/builders";
import { ButtonStyle } from "seyfert/lib/types";

@Declare({
	name: "ping",
	description: "Ping the bot",
})
export default class PingCommand extends SubCommand {
	async run(ctx: CommandContext<never, "prepare">) {
		const ping = ctx.client.gateway.get(0)?.latency as number;

		const { lang } = ctx.metadata.prepare;

		const actionRow = new ActionRow<Button>().addComponents(
			new Button().setCustomId("ping-re-run").setStyle(ButtonStyle.Primary).setLabel("Reload")
		);

		const res = await ctx.editOrReply(
			{
				content: "Pong",
				components: [actionRow],
			},
			true
		);

		const collector = res.createComponentCollector({
			filter: (i) => i.user.id === ctx.author.id,
			idle: 3000 * 10,
		});

		collector.run("ping-re-run", (i) => {
			i.update({
				content: lang.commands.info.ping.success({ ping }),
				components: [],
			});
		});
	}
}
