import PaprClass from "papr";
import { Logger } from "@repo/logger";
import { MongoClient } from "mongodb";
import { injectable } from "inversify";
import { GuildSchema } from "./models/guild";
import { UserSchema } from "./models/user";
import { ImageHistorySchema } from "./models/history";

@injectable()
class Papr extends PaprClass {
	private logger = new Logger(Papr.name);

	// models
	guild = this.model("guild", GuildSchema);
	user = this.model("user", UserSchema);
	imageHistory = this.model("imageHistory", ImageHistorySchema);

	constructor() {
		super({});

		this.logger.info("PaprService initialized");
	}

	async start(uri: string) {
		const connection = await MongoClient.connect(uri);
		this.initialize(connection.db());

		this.logger.info("Connected to MongoDB");

		await this.updateSchemas();
	}
}

export { Papr };
