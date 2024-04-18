/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { config } = require("seyfert");
require("dotenv/config");

module.exports = config.bot({
	locations: {
		base: "src",
		commands: "commands",
		events: "events",
		output: "dist",
		langs: "languages"
	},
	token: process.env.BOT_TOKEN ?? "",
	intents: ["Guilds", "GuildMessages", "MessageContent"]
});
