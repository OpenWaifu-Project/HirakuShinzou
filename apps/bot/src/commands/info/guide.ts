import { type CommandContext, Declare, Options, SubCommand, createStringOption } from "seyfert";
import { ActionRow, Button, Embed } from "seyfert/lib/builders";
import { ButtonStyle } from "seyfert/lib/types";

const options = {
	section: createStringOption({
		description: "The section of the guide to view",
		choices: [
			{ name: "Introduction", value: "introduction" },
			{ name: "Prompting", value: "prompting" },
		] as const,
		required: true,
	}),
};

@Declare({
	name: "image-guide",
	description: "View the image generation module guide",
})
@Options(options)
export default class ImageGuideCommand extends SubCommand {
	async run(ctx: CommandContext<typeof options, "prepare">) {
		const section = ctx.options.section;

		const user = ctx.author;
		const lang = ctx.metadata.prepare.lang.commands.info.guide;
		let page = 0;

		const guideSection = lang[section];

		const buildEmbed = () => {
			// biome-ignore lint/suspicious/noAssignInExpressions: Looks cute
			const data = guideSection.at(page) ?? guideSection[(page = 0)];
			const embed = new Embed()
				.setAuthor({ name: user.name })
				.setTitle(data.title)
				.setDescription(data.content.join("\n"))
				.setImage(data.image)
				.setTimestamp(Date.now())
				.setFooter({
					text: `Page ${guideSection.indexOf(data) + 1}/${guideSection.length}`,
				})
				.setColor("#4338ca");

			return embed;
		};

		const actionRow = new ActionRow<Button>().addComponents(
			new Button().setCustomId("previous").setEmoji("◀️").setStyle(ButtonStyle.Primary),
			new Button().setCustomId("next").setEmoji("▶️").setStyle(ButtonStyle.Primary)
		);

		const res = await ctx.editOrReply(
			{
				embeds: [buildEmbed()],
				...(section === "introduction" ? {} : { components: [actionRow] }),
			},
			true
		);

		const collector = res.createComponentCollector({
			filter: (i) => i.user.id === ctx.author.id,
			idle: 3000 * 10,
		});

		collector.run("next", (i) => {
			page++;
			i.update({
				embeds: [buildEmbed()],
			});
		});

		collector.run("previous", (i) => {
			page--;
			i.update({
				embeds: [buildEmbed()],
			});
		});
	}
}
