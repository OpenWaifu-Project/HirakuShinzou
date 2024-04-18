import { type CommandContext, Declare, SubCommand } from "seyfert";
import { ActionRow, Button, Embed } from "seyfert/lib/builders";
import { ButtonStyle } from "seyfert/lib/types";

@Declare({
	name: "tags",
	description: "View all your tags",
})
export default class TagsCommand extends SubCommand {
	async run(context: CommandContext<never, "prepare">) {
		const userDat = context.metadata.prepare.user;
		let page = 1;
		const lang = context.metadata.prepare.lang.commands.info.tags;

		if (!userDat.imageTags.length) {
			return context.editOrReply({
				content: lang.noTags,
			});
		}

		const mappedTags = this.chunkArray(userDat.imageTags.map((tag) => `**%${tag.prompt}%** - \`${tag.tag}\``));

		const genEmbed = (page: number) => {
			const currentImage = mappedTags[page - 1];
			const embed = new Embed()
				.setAuthor({
					name: context.author.username,
					iconUrl: context.author.avatarURL(),
				})
				.setThumbnail(context.author.avatarURL())
				.setColor(4405450)
				.setDescription(currentImage)
				.setFooter({ text: `Page: ${page}/${mappedTags.length}` });

			return embed;
		};

		const actionRow = new ActionRow<Button>().addComponents(
			new Button().setCustomId("previous").setEmoji("◀").setStyle(ButtonStyle.Primary),
			new Button().setCustomId("next").setEmoji("▶").setStyle(ButtonStyle.Primary)
		);

		const res = await context.editOrReply(
			{
				embeds: [genEmbed(page)],
				components: [actionRow],
			},
			true
		);

		const collector = res.createComponentCollector({
			filter: (i) => i.user.id === context.author.id,
			idle: 3000 * 10,
		});

		collector.run("next", (i) => {
			page++;
			i.update({
				embeds: [genEmbed(page)],
			});
		});

		collector.run("previous", (i) => {
			page--;
			i.update({
				embeds: [genEmbed(page)],
			});
		});
	}

	chunkArray(array: string[]) {
		return array.reduce((prev, curr) => {
			if (!prev.length) {
				return [curr];
			}
			if (prev.join("").length + curr.length > 4096) {
				prev.push(curr.length > 4096 ? `${curr.slice(0, 4095)}\`` : curr);
			} else {
				prev[prev.length - 1] += `\n${curr.slice()}`;
			}

			return prev;
		}, [] as string[]);
	}
}
