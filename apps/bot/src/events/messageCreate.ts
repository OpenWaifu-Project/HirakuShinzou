import { Content } from "@google/generative-ai";
import { inject, injectable } from "inversify";
import { UsingClient } from "seyfert";
import { ClientDataEvent, ClientEvent, EventContext } from "seyfert/lib/events";
import { Message } from "seyfert/lib/structures";
import { container } from "../inversify.config";
import { constants } from "../lib/constants";
import { createGeminiCompletion, createGeminiImage } from "../lib/scripts/createCompletion";
import { RedisClient } from "../lib/structures/redis";
import { clean, formatMessage } from "../lib/utils/functions";

const chatCooldown = new Set();

const INIT_CONTENT = (user: string) => [
	{
		role: "user",
		parts: [
			{
				text: "Let's start an amazing conversation!",
			},
		],
	},
	{
		role: "model",
		parts: [
			{
				text: [
					`${constants.CHATBOT_PROMPTS_V2.jailbreak.join(" ").replaceAll("{{user}}", user)}`,
					`${constants.CHATBOT_PROMPTS_V2.character.join(" ")}`,
					`${constants.CHATBOT_PROMPTS_V2.end.join(" ")}`,
				].join("\n"),
			},
		],
	},
];

@injectable()
class MessageCreateEvent implements ClientEvent {
	@inject(RedisClient) private readonly redis!: RedisClient;

	data: ClientDataEvent = {
		name: "messageCreate",
		once: false,
	};

	async run(...[message, client]: EventContext<{ data: { name: "messageCreate" } }>) {
		if (!message.guildId || message.author.bot) return;

		const commandRegex = new RegExp(`^<@!?${client.botId}> eval`);
		if (commandRegex.test(message.content) && constants.DEVS.includes(message.author.id))
			return this.evalHandle(message, client);

		const mentionRegex = new RegExp(`^<@!?${client.botId}>`);
		if (mentionRegex.test(message.content) || message.referencedMessage?.author.id === client.botId) {
			await this.chatHandle(message, client);
		}
	}

	// biome-ignore lint/correctness/noUnusedVariables: This function is used in the eval command and I use client instead _client
	async evalHandle(message: Message, client: UsingClient) {
		if (!constants.DEVS.includes(message.author.id)) return;
		const args = message.content.trim().split(/\s/).slice(2);

		try {
			// biome-ignore lint/security/noGlobalEval: fucked it
			const codeResponse = await eval(args.join(" "));
			const cleanedCode = clean(codeResponse);
			await message.reply({
				content: `\`\`\`js\n${cleanedCode}\`\`\``,
			});
		} catch (err) {
			await message.reply({ content: `\`\`\`xl\n${err}\`\`\`` });
		}
		return;
	}

	async chatHandle(message: Message, client: UsingClient) {
		if (chatCooldown.has(message.author.id)) return;
		chatCooldown.add(message.author.id);
		try {
			await client.channels.typing(message.channelId);
			const history = await this.redis.get(`chat:${message.guildId}`);
			const guildHistory = history ? JSON.parse(history) : INIT_CONTENT(message.author.username);

			const guildHistoryObject: Content = {
				role: "user",
				parts: [
					{
						text: await formatMessage(message, client),
					},
				],
			};

			// If the message has attachments, we'll create send the image to the image completion API.
			const res =
				message.attachments.length > 0
					? await createGeminiImage(message.attachments, message.content)
					: await createGeminiCompletion(guildHistory, guildHistoryObject);

			await message.reply({
				content: res.length ? res : "Sorry, I'm having trouble understanding you. Could you try again?",
				allowed_mentions: { roles: [] },
			});

			guildHistory.push(guildHistoryObject, {
				role: "model",
				parts: [
					{
						text: `Hiraku Shinzou: ${res}`,
					},
				],
			});

			if (guildHistory.length > 24) {
				guildHistory.splice(2, 2);
			}

			await this.redis.set(`chat:${message.guildId}`, JSON.stringify(guildHistory));
		} catch (e) {
			client.logger.error(e);
		}
		setTimeout(() => chatCooldown.delete(message.author.id), 3000); // 3 seconds cooldown
	}
}

export default container.resolve(MessageCreateEvent);
