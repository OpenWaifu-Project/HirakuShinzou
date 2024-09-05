import { createEvent } from "seyfert";
import { Embed } from "seyfert/lib/builders";

export default createEvent<"guildDelete">({
	data: { name: "guildDelete" },
	async run({ id, unavailable }, client) {
		if (unavailable) return;
		const guild = client.cache.guilds?.get(id);
		if (!guild) return;

		const embed = new Embed()
			.setAuthor({
				name: guild.name,
				iconUrl: guild.iconURL(),
			})
			.setDescription(
				[
					`**Member count**: ${guild.memberCount}`,
					`**Channels count**: ${client.cache.channels?.count(guild.id)}`,
					`**Guild Id**: ${guild.id}`,
					`**Left At**: ${new Date().toLocaleString("es-NI")}`,
				].join("\n")
			)
			.setColor("Red");

		await client.messages.write("1198029086451314688", {
			embeds: [embed],
		});
	},
});
