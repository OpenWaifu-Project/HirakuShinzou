import { InjectQueue } from "@repo/bull";
import { Job, Queue } from "bull";
import { injectable } from "inversify";
import { AnimeJobI } from "./anime.queue";
import { Hiraku } from "../../structures/hiraku";
import { GuildService, ImageHistoryService, UserService } from "@repo/database";
import { AttachmentBuilder, Embed, Message, TextGuildChannel } from "seyfert";
import { ImageModels, constants } from "../../constants";
import { DalleJobI } from "./dalle.queue";
import { ProdiaJobI } from "./prodia.queue";

@injectable()
export class ImageProducer {
	constructor(
		@InjectQueue("anime") private animeQueue: Queue<AnimeJobI>,
		@InjectQueue("dalle") private dalleQueue: Queue<DalleJobI>,
		@InjectQueue("prodia") private prodiaQueue: Queue<ProdiaJobI>,
		private readonly client: Hiraku,
		private readonly guildService: GuildService,
		private readonly userService: UserService,
		private readonly imageHistoryService: ImageHistoryService
	) {
		this.animeQueue.on("completed", this.sendImage.bind(this));
		this.dalleQueue.on("completed", this.sendImage.bind(this));
		this.prodiaQueue.on("completed", this.sendImage.bind(this));
	}

	public clearQueue(queue: "anime" | "dalle" | "prodia") {
		return this[`${queue}Queue`].empty();
	}

	public produceAnimeStyle(data: AnimeJobI) {
		return this.animeQueue.add(data, {
			removeOnComplete: true,
			removeOnFail: true,
		});
	}

	public produceDalle(data: DalleJobI) {
		return this.dalleQueue.add(data, {
			removeOnComplete: true,
			removeOnFail: true,
		});
	}

	public produceProdia(data: ProdiaJobI) {
		return this.prodiaQueue.add(data, {
			removeOnComplete: true,
			removeOnFail: true,
		});
	}

	public getJobCounts(queue: "anime" | "dalle" | "prodia") {
		return this[`${queue}Queue`].getJobCounts();
	}

	/**
	 * This method is called when the image is generated and sent to the channel
	 * TODO: move this to another place since it's not related to the producer
	 */
	public async sendImage(job: Job<AnimeJobI> | Job<DalleJobI> | Job<ProdiaJobI>, result: Buffer) {
		const channel = await this.client.channels.fetch(job.data.channelId);
		if (!channel?.isTextGuild()) return;

		const guild = await this.guildService.get(channel.guildId!);
		const lang = this.client.t(guild.language).get();
		const blur = guild.imageSettings.blur ?? true;

		const sendedMsg = await channel.messages
			.write({
				content: `<@${job.data.userId}> **${blur ? lang.imageGenerated.blurWarning : lang.imageGenerated.imageReady}**`,
				files: [new AttachmentBuilder().setName("image.png").setFile("buffer", result).setSpoiler(blur)],
			})
			.catch((err) => console.error(err));

		if (!(sendedMsg instanceof Message)) return;

		const user = await this.client.users.fetch(job.data.userId);
		const embed = new Embed()
			.setTitle("Image Generated")
			.setDescription(
				[
					`**User**: ${user.username} (${job.data.userId})`,
					`**Channel**: ${channel.name} (${channel.id})`,
					`**Guild**: ${(await channel.guild()).name} (${job.data.guildId})`,
					`**Type**: ${job.data.type}`,
					`**Model**: ${job.data.model}`,
					"",
					`**Prompt**: ${job.data.imageData.prompt}`,
					`**Resolution**: ${job.data.imageData.width}x${job.data.imageData.height}`,
				].join("\n")
			)
			.setImage(sendedMsg.attachments[0].url)
			.setColor(4405450);

		await this.client.messages.write(constants.IMAGE_LOG_CHANNEL_ID, {
			embeds: [embed],
		});

		await this.imageHistoryService.create({
			prompt: job.data.imageData.prompt,
			width: job.data.imageData.width,
			height: job.data.imageData.height,
			genType: job.data.type,
			model: ImageModels[job.data.model as keyof typeof ImageModels].name,
			...(job.data.model === "anime" && { negativePrompt: (job.data as AnimeJobI).imageData.negativePrompt }),
			url: sendedMsg.attachments[0].url,
			userId: job.data.userId,
		});
	}

	async onFailed(job: Job<AnimeJobI> | Job<DalleJobI> | Job<ProdiaJobI>, err: Error) {
		const logChannel = (await this.client.channels.fetch(constants.IMAGE_LOG_CHANNEL_ID)) as TextGuildChannel;
		await logChannel.messages.write({
			content: `Error while trying to gen for ${job.data.userId}! \n\`${err}\``,
		});

		const modelUsed = ImageModels[job.data.model as keyof typeof ImageModels];

		await this.userService.updateTokens(job.data.userId, "image", modelUsed.tokensPerUse);

		const channel = (await this.client.channels.fetch(job.data.channelId)) as TextGuildChannel;

		const guildData = await this.guildService.get(channel.guildId!);
		const lang = this.client.t(guildData.language).get();

		await channel.messages.write({
			content: `<@${job.data.userId}> ${lang.imageGenerated.error}`,
		});
	}
}
