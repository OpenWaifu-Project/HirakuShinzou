import { injectable } from "inversify";
import { Logger } from "@repo/logger";
import { Papr } from "./papr";
import { UserDocument } from "./models/user";
import { ObjectId } from "mongodb";

@injectable()
class UserService {
	private logger = new Logger(UserService.name);

	constructor(private readonly papr: Papr) {}
	async get(id: string, createIfNotExists?: true): Promise<UserDocument>;
	async get(id: string, createIfNotExists: false): Promise<UserDocument | null>;
	async get(id: string, createIfNotExists = true): Promise<UserDocument | null> {
		let user = await this.papr.user.findById(id);

		if (!user && createIfNotExists) {
			this.logger.info(`Creating user ${id}.`);
			user = await this.papr.user.insertOne({ _id: id });
		}

		return user;
	}

	updateTag(id: string, prompt: string, tag: string) {
		return this.papr.user.updateOne(
			{ _id: id, "imageTags.prompt": prompt },
			{
				$set: {
					"imageTags.$": {
						prompt,
						tag,
					},
				},
			}
		);
	}

	createTag(id: string, prompt: string, tag: string) {
		return this.papr.user.updateOne(
			{ _id: id },
			{
				$push: {
					imageTags: {
						prompt,
						tag,
					},
				},
			}
		);
	}

	deleteTag(id: string, prompt: string) {
		return this.papr.user.updateOne(
			{ _id: id },
			{
				$pull: {
					imageTags: { prompt },
				},
			}
		);
	}

	createImageHistory(id: string, imageId: ObjectId) {
		return this.papr.user.updateOne(
			{ _id: id },
			{
				$push: {
					"stats.imageHistory": imageId,
				},
			}
		);
	}

	updateTokens(id: string, type: "image" | "chat", amount: number) {
		return this.papr.user.updateOne(
			{ _id: id },
			{
				$inc: {
					[`tokens.${type}`]: amount,
				},
			}
		);
	}

	updateUser(id: string, update: Partial<UserDocument>) {
		return this.papr.user.updateOne({ _id: id }, { $set: update });
	}

	async bulkUpdateMonthly() {
		const result = await this.papr.user.updateMany(
			{},
			{
				$set: {
					"tokens.image": 10,
				},
			}
		);

		this.logger.info(`Monthly reset done, updated ${result.modifiedCount} users`);

		const result_membershipI = await this.papr.user.updateMany(
			{ "membership.plan": "Tier I" },
			{
				$set: {
					"tokens.image": 200,
				},
			}
		);

		this.logger.info(`Monthly reset done, updated ${result_membershipI.modifiedCount} users to Tier I`);

		const result_membershipII = await this.papr.user.updateMany(
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
