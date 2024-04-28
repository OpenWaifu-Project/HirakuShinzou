import type defaultLang from "../../languages/en";
import { injectable } from "inversify";
import { startDB } from "@repo/database";
import { type ParseLocales, Client, type ParseMiddlewares, type ParseClient } from "seyfert";
import type { allMiddlewares } from "../../middlewares";
import { HirakuLogger } from "./logger";
import { container } from "../../inversify.config";

@injectable()
class Hiraku extends Client {
	logger = new HirakuLogger({});

	constructor() {
		super({
			globalMiddlewares: ["logger"],
		});

		if (this.events) {
			this.events.onFail = async (name, err) => this.logger.error(`${name}: ${err}`);
		}
	}

	async init() {
		this.setServices({
			middlewares: (await import("../../middlewares")).allMiddlewares,
			handlers: {
				commands: {
					onCommand: (file) => {
						return container.resolve(file);
					},
					onSubCommand: (file) => {
						return container.resolve(file);
					},
				},
			},
		});
		await this.start();
		await this.uploadCommands();
		await startDB(process.env.MONGO_URI);
	}
}

export { Hiraku };

declare module "seyfert" {
	interface DefaultLocale extends ParseLocales<typeof defaultLang> {}
	interface UsingClient extends ParseClient<Client<true>> {
		withPrefix: false;
	}

	interface RegisteredMiddlewares extends ParseMiddlewares<typeof allMiddlewares> {}
}

declare global {
	// biome-ignore lint/style/noNamespace: <explanation>
	namespace NodeJS {
		interface ProcessEnv {
			OPENAI_API_KEY: string;
			OPENROUTER_API_KEY: string;
			MONGO_URI: string;
			GOOGLE_AI_KEY: string;
			BOT_TOKEN: string;
			PRODIA_API_KEY: string;
			REDIS_HOST: string;
			REDIS_PORT: string;
			ANIME_API_URL: string;
			ANIME_API_MODEL: string;
			ANIME_API_TOKEN: string;
		}
	}
}
