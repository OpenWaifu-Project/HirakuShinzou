import { ActionRow, Button, type CommandContext, Embed } from "seyfert";
import { EmbedColors } from "seyfert/lib/common";
import { ButtonStyle } from "seyfert/lib/types";
import { ImageModels } from "../constants";
import { checkModeration } from "./moderation";

/**
 * TODO: Improve this function, nejire code detected
 */
export const preHandleImageGen = async (
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	ctx: CommandContext<any, "prepare">,
	prompt: string,
	model: keyof typeof ImageModels
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
): Promise<boolean | string> => {
	const guildData = ctx.metadata.prepare.guild;
	const userData = ctx.metadata.prepare.user;
	const lang = ctx.metadata.prepare.lang.commands.fun.image;

	if (!guildData.imageSettings.status) {
		await ctx.editOrReply({
			content: lang.disabled,
		});
		return false;
	}

	if (guildData.imageSettings.channel && guildData.imageSettings.channel !== ctx.channelId) {
		await ctx.editOrReply({
			content: lang.disabledChannel({
				channel: guildData.imageSettings.channel ?? "",
			}),
		});

		return false;
	}

	const userTags = userData.imageTags;
	const matchTags = prompt.match(/%([^%]+)%/g);

	if (userTags && matchTags) {
		for (const match of matchTags) {
			const tag = userTags.find((tag) => tag.prompt === match.slice(1, -1));

			if (tag) {
				// biome-ignore lint/style/noParameterAssign: <explanation>
				prompt = prompt.replace(match, tag.tag);
			}
		}
	}

	const tokens = userData.tokens.image;
	const modelInfo = ImageModels[model];
	if (!tokens || (modelInfo.tokensPerUse > tokens && tokens > -1)) {
		await ctx.editOrReply({
			content: lang.insufficientTokens,
		});
		return false;
	}

	if (modelInfo.allowedTiers.length && (modelInfo.allowedTiers as string[]).includes(userData.membership.plan)) {
		await ctx.editOrReply({
			content: lang.insufficentMembership,
		});
		return false;
	}

	if (
		!(
			ctx.interaction!.appPermissions &&
			(ctx.interaction!.appPermissions.has("SendMessages", "AttachFiles") ||
				ctx.interaction!.appPermissions.has("Administrator"))
		)
	) {
		await ctx.editOrReply({
			content: lang.insufficientPermissions,
		});
		return false;
	}

	const moderation = await checkModeration(prompt).catch(() => false);
	if (typeof moderation !== "boolean") {
		const includesHighFilter = moderation.includes("sexual/minors");

		if (moderation.length) {
			if (includesHighFilter) {
				ctx.interaction.editOrReply({
					content: lang.filter.highFilter,
				});
				return false;
			}

			const { channel } = ctx.interaction;
			if (channel?.isTextGuild() && !channel.nsfw) {
				if (guildData.imageSettings.filter ?? true) {
					ctx.interaction.editOrReply({
						content: lang.filter.noValidChannel,
						embeds: [new Embed().setColor(EmbedColors.Red).setDescription(lang.filter.noValidChannelEmbed)],
					});
					return false;
				}

				// biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
				return new Promise<string | false>(async (res) => {
					const actionRow = new ActionRow<Button>().addComponents(
						new Button().setCustomId("cancel").setStyle(ButtonStyle.Danger).setLabel("Cancel"),
						new Button().setCustomId("continue").setStyle(ButtonStyle.Success).setLabel("Continue")
					);

					const resmsg = await ctx.editOrReply(
						{
							content: lang.filter.triggered({ flags: moderation }),
							components: [actionRow],
						},
						true
					);

					const collector = resmsg.createComponentCollector({
						filter: (i) => i.user.id === ctx.interaction.user.id,
						idle: 60000,
						onStop: async () => {
							await ctx.editOrReply({
								content: lang.filter.notReplied,
								components: [],
							});
							return;
						},
					});

					collector.run("cancel", (i) => {
						i.update({
							content: lang.filter.denied,
							components: [],
						});
						return res(false);
					});

					collector.run("continue", (i) => {
						i.update({
							components: [],
						});
						return res(prompt);
					});
				});
			}

			return prompt;
		}
	}

	return prompt;
};
