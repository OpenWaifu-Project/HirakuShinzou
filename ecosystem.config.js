module.exports = {
	apps: [
		{
			namespace: "Hiraku-Project",
			name: "discordbot",
			script: "npm run start",
			cwd: "./apps/bot",
			watch: "."
		},
		{
			namespace: "Hiraku-Project",
			name: "topgg-tracker",
			script: "npm run start",
			cwd: "./apps/topgg-tracker",
			watch: "."
		}
	]
};
