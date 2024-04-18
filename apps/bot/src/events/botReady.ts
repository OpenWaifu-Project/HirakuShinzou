import { createEvent } from "seyfert";

export default createEvent<"botReady">({
	data: { once: true, name: "botReady" },
	async run(user, client, shard) {
		client.logger.info(`Start ${user.username} on shard #${shard}`);
	},
});
