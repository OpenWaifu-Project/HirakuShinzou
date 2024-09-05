// import { injectable } from "inversify";
// import { type imageHistoryI, imageHistoryModel } from "./models/history";
// import type mongoose from "mongoose";
// import type { AnyKeys } from "mongoose";
// import { userModel } from "./models/user";

import { injectable } from "inversify";
import { Papr } from "./papr";
import { Logger } from "@repo/logger";
import { ImageHistoryDocument } from "./models/history";
import { ObjectId } from "mongodb";

@injectable()
class ImageHistoryService {
	private logger = new Logger(ImageHistoryService.name);

	constructor(private readonly papr: Papr) {}

	async create(data: Omit<ImageHistoryDocument, "_id">) {
		const userId = data.userId;
		const doc = await this.papr.imageHistory.insertOne(data);
		await this.papr.user.updateOne({ _id: userId }, { $push: { imageHistory: doc._id } });
		return true;
	}

	async delete(id: ObjectId) {
		const document = await this.papr.imageHistory.findOne({ _id: id });
		if (!document) return;
		await this.papr.imageHistory.deleteOne({ _id: id });
		await this.papr.user.updateOne({ _id: document.userId }, { $pull: { imageHistory: id } });
	}

	filterByUser(
		userId: string,
		filters: {
			prompt?: string[];
			model?: string;
			genType?: string;
		}
	) {
		const { prompt, model, genType } = filters;

		return this.papr.imageHistory.find(
			{
				userId,
				...(prompt && { prompt: { $in: prompt.map((p) => new RegExp(p, "i")) } }),
				...(genType && { genType }),
				...(model && { model }),
			},
			{
				sort: { createdAt: -1 },
			}
		);
	}
}

export { ImageHistoryService };
