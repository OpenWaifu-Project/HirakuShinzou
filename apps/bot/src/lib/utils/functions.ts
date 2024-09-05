import util from "node:util";
import { UsingClient } from "seyfert";
import { Message } from "seyfert/lib/structures";

function clean(text: string) {
	const cleanedText = typeof text !== "string" ? util.inspect(text, { depth: 1 }) : text;

	return cleanedText.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
}

export { clean };

export async function formatMessage(message: Message, client: UsingClient) {
	const mentionRegex = /<@!?(\d+)>/g;

	let content = `${message.author.username}: ${message.content}`;

	if (message.attachments.length > 0) {
		content += `\n${message.attachments.map((attachment) => `[IMAGE](${attachment.url})`).join("\n")}`;
	}

	const matches = content.match(mentionRegex);
	if (!matches) return content.trim();

	const processedMentions: string[] = [];
	for (const match of matches) {
		const userId = match.match(/\d+/)?.[0];
		if (!userId) return match;

		const user = await client.users.fetch(userId).catch(() => match);
		processedMentions.push(typeof user === "string" ? user : user.username ?? "Hiraku Shinzou");
	}

	const formattedmessage = content.replace(mentionRegex, () => `@${processedMentions.shift()}` || "");

	return formattedmessage.trim();
}
