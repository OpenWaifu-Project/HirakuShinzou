import { CommandContext, Declare, SubCommand, createStringOption } from "seyfert";
import { ImageProducer } from "../../lib/jobs/image/image.producer";
import { inject } from "inversify";

const options = {
	queue: createStringOption({
		description: "The queue to clear",
		required: true,
		choices: [
			{ name: "Anime", value: "anime" },
			{ name: "Dalle", value: "dalle" },
			{ name: "Prodia", value: "prodia" },
		] as const,
	}),
};

@Declare({
	name: "clearqueue",
	description: "Clear the image queue (dev only)",
})
export default class ClearQueueCommand extends SubCommand {
	@inject(ImageProducer) private readonly imageProducer!: ImageProducer;

	async run(ctx: CommandContext<typeof options, "prepare">) {
		await ctx.interaction.deferReply();

		const queue = ctx.options.queue;
		await this.imageProducer.clearQueue(queue);

		await ctx.interaction.editOrReply({
			content: `Cleared ${queue} queue!`,
		});
	}
}
