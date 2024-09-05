import { createEvent } from "seyfert";
import { container } from "../inversify.config";
import { GuildService } from "@repo/database";
import { Embed } from "seyfert/lib/builders";
import { Guild } from "seyfert/lib/structures";

const discordLocales = {
	"en-US": "en",
	"es-ES": "es",
};

export default createEvent<"guildCreate">({
	data: { name: "guildCreate" },
	async run(guild, client) {
		// send log to discord guild
		await client.messages.write("1198029086451314688", {
			embeds: [await logEmbed(guild)],
		});

		const guildService = container.get(GuildService);
		let guildData = await guildService.get(guild.id, false);
		if (!guildData) {
			guildData = await guildService.create({
				_id: guild.id,
				language: discordLocales[guild.preferredLocale as keyof typeof discordLocales] ?? "en",
			});
		}

		const guildLocale = guildData.language;
		const t = client.t(guildLocale).get();
		if (!guild.systemChannelId) return;

		const channel = await guild.channels.fetch(guild.systemChannelId);
		if (!channel.isTextGuild()) return;

		const embed = new Embed()
			.setAuthor({
				name: guild.name,
				iconUrl: guild.iconURL(),
			})
			.setDescription(t.welcomeGuild.message.join("\n"))
			.setColor("#4f46e5")
			.setImage(
				"https://media.discordapp.net/attachments/1187839305788424283/1199495566573445220/artist__bee_deadflow_clear_blue_hair_short_hair_blue_eyes_dev_dev0614_s-307986703.png"
			);

		await channel.messages
			.write({
				embeds: [embed],
			})
			.catch((err) => console.log(err));
	},
});

async function logEmbed(guild: Guild<"create">) {
	const owner = await guild.fetchOwner();

	const embed = new Embed()
		.setAuthor({
			name: guild.name,
			iconUrl: guild.iconURL(),
		})
		.setDescription(
			[
				`**Member count**: ${guild.memberCount}`,
				`**Channels count**: ${(await guild.channels.list()).length}`,
				owner ? `**Owner**: ${owner.user.globalName} (${owner.user.id})` : "**Owner**: Unknown",
				`**Guild Id**: ${guild.id}`,
				`**Locale**: ${guild.preferredLocale}`,
				`**Joined At**: ${new Date().toLocaleString("es-NI")}`,
			].join("\n")
		)
		.setColor("Green");

	return embed;
}
