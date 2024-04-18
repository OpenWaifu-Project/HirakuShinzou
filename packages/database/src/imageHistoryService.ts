import { injectable } from "inversify";
import { type imageHistoryI, imageHistoryModel } from "./models/history";
import type mongoose from "mongoose";
import type { AnyKeys } from "mongoose";
import { userModel } from "./models/user";

@injectable()
class ImageHistoryService {
	async getHistoryByUser(
		userId: string,
		filters: {
			prompt?: string[];
			model?: string;
			genType?: string;
		}
	) {
		const { prompt, model, genType } = filters;

		return imageHistoryModel.aggregate([
			{
				$match: {
					user: userId,
					...(prompt && {
						prompt: { $in: prompt.map((p) => new RegExp(p, "i")) },
					}),
					...(genType && {
						genType,
					}),
					...(model && {
						model,
					}),
				},
			},
			{
				$sort: {
					date: -1,
				},
			},
		]);
	}

	async create(data: imageHistoryI | AnyKeys<imageHistoryI>) {
		return (await imageHistoryModel.create(data)).toObject();
	}

	async delete(id: mongoose.Types.ObjectId, userId: string) {
		await userModel.updateOne(
			{ _id: userId },
			{
				$pull: { "stats.imageHistory": id },
			}
		);
		return imageHistoryModel.deleteOne({ _id: id });
	}

	get model() {
		return imageHistoryModel;
	}
}

export { ImageHistoryService };
