import { injectable } from "inversify";
import { type GuildSchemaI, guildModel } from "./models/guild";
import type { AnyKeys, UpdateQuery, UpdateWithAggregationPipeline } from "mongoose";

@injectable()
class GuildService {
	async get(id: string, createIfNotExists?: true): Promise<GuildSchemaI>;
	async get(id: string, createIfNotExists: false): Promise<GuildSchemaI | null>;
	async get(id: string, createIfNotExists = true): Promise<GuildSchemaI | null> {
		let guild = await guildModel.findById(id).lean();
		if (!guild && createIfNotExists) {
			guild = (await guildModel.create({ _id: id })).toObject();
		}
		return guild;
	}

	async update(id: string, data: UpdateQuery<GuildSchemaI> | UpdateWithAggregationPipeline) {
		const guild = await guildModel.updateOne({ _id: id }, data).lean();
		return guild;
	}

	async create(data: GuildSchemaI | AnyKeys<GuildSchemaI>) {
		return (await guildModel.create(data)).toObject();
	}

	get model() {
		return guildModel;
	}
}

export { GuildService };
