import { injectable } from "inversify";
import { type UserSchemaI, userModel } from "./models/user";
import type { Types, UpdateQuery, UpdateWithAggregationPipeline } from "mongoose";
import { Logger } from "@repo/logger";

@injectable()
class UserService {
	private logger = new Logger(UserService.name);

	async get(id: string, createIfNotExists?: true): Promise<UserSchemaI>;
	async get(id: string, createIfNotExists: false): Promise<UserSchemaI | null>;
	async get(id: string, createIfNotExists = true): Promise<UserSchemaI | null> {
		let user = await userModel.findById(id).lean();
		if (!user && createIfNotExists) {
			user = (await userModel.create({ _id: id })).toObject();
		}
		return user;
	}

	async update(id: string, data: UpdateQuery<UserSchemaI> | UpdateWithAggregationPipeline) {
		const guild = await userModel.updateOne({ _id: id }, data).lean();
		return guild;
	}

	updateTag(id: string, prompt: string, tag: string) {
		return userModel.findByIdAndUpdate(
			id,
			{
				$set: {
					"imageTags.$[elem].tags": tag,
				},
			},
			{
				arrayFilters: [{ "elem.prompt": prompt }],
			}
		);
	}

	createTag(id: string, prompt: string, tag: string) {
		return userModel.findByIdAndUpdate(id, {
			$push: {
				imageTags: {
					prompt,
					tag,
				},
			},
		});
	}

	deleteTag(id: string, prompt: string) {
		return userModel.findByIdAndUpdate(id, {
			$pull: { imageTags: { prompt } },
		});
	}

	createImageHistory(id: string, imageId: Types.ObjectId) {
		return userModel.findByIdAndUpdate(id, {
			$push: {
				"stats.imageHistory": imageId,
			},
		});
	}

	async bulkUpdateMonthly() {
		const result = await userModel.updateMany(
			{},
			{
				$set: {
					"tokens.image": 10,
				},
			}
		);

		this.logger.info(`Monthly reset done, updated ${result.modifiedCount} users`);

		const result_membershipI = await userModel.updateMany(
			{ "membership.plan": "Tier I" },
			{
				$set: {
					"tokens.image": 200,
				},
			}
		);
		this.logger.info(`Monthly reset done, updated ${result_membershipI.modifiedCount} users to Tier I`);

		const result_membershipII = await userModel.updateMany(
			{ "membership.plan": "Tier II" },
			{
				$set: {
					"tokens.image": 500,
				},
			}
		);
		this.logger.info(`Monthly reset done, updated ${result_membershipII.modifiedCount} users to Tier II`);
	}
}

export { UserService };
