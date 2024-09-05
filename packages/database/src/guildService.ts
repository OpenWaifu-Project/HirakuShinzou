// import { injectable } from "inversify";
// import { type GuildSchemaI, guildModel } from "./models/guild";
// import type { AnyKeys, UpdateQuery, UpdateWithAggregationPipeline } from "mongoose";

import { injectable } from "inversify";
import { Papr } from "./papr";
import { GuildDocument, GuildOptions } from "./models/guild";
import { Logger } from "@repo/logger";
import { DocumentForInsert } from "papr";

@injectable()
class GuildService {
	private logger = new Logger(GuildService.name);

	constructor(private readonly papr: Papr) {}

	async get(id: string, createIfNotExists?: true): Promise<GuildDocument>;
	async get(id: string, createIfNotExists: false): Promise<GuildDocument | null>;
	async get(id: string, createIfNotExists = true): Promise<GuildDocument | null> {
		let guild = await this.papr.guild.findById(id);

		if (!guild && createIfNotExists) {
			this.logger.info(`Creating guild ${id}.`);
			guild = await this.papr.guild.insertOne({ _id: id });
		}

		return guild;
	}

	updateGuildSettings(id: string, data: Omit<DocumentForInsert<GuildDocument, GuildOptions>, "_id">) {
		return this.papr.guild.updateOne({ _id: id }, { $set: { ...data } });
	}

	create(data: DocumentForInsert<GuildDocument, GuildOptions>) {
		return this.papr.guild.insertOne({ ...data });
	}
}

export { GuildService };
