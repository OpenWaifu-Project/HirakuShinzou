import { Guild, createEvent } from "seyfert";
import { Embed } from "seyfert/lib/builders";

export default createEvent<"guildDelete">({
	data: { name: "guildDelete" },
	async run(guild, client) {
		if (guild.unavailable) return;
		const g = guild as Guild<"cached">;

		const embed = new Embed()
			.setAuthor({
				name: g.name,
				iconUrl: g.iconURL(),
			})
			.setDescription(
				[
					`**Member count**: ${g.memberCount}`,
					`**Channels count**: ${client.cache.channels?.count(g.id)}`,
					`**Guild Id**: ${g.id}`,
					`**Left At**: ${new Date().toLocaleString("es-NI")}`,
				].join("\n")
			)
			.setColor("Red");

		await client.messages.write("1198029086451314688", {
			embeds: [embed],
		});
	},
});
