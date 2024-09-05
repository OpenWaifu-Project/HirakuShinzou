import type defaultLang from "../../languages/en";
import { injectable } from "inversify";
import { type ParseLocales, Client, type ParseMiddlewares, type ParseClient } from "seyfert";
import type { allMiddlewares } from "../../middlewares";
import { container } from "../../inversify.config";
import { Logger } from "@repo/logger";
import { Papr } from "@repo/database";

@injectable()
class Hiraku extends Client {
	private readonly _logger = new Logger("Hiraku");

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
		});

		if (this.commands) {
			this.commands.onCommand = (file) => {
				return container.resolve(file);
			};

			this.commands.onSubCommand = (file) => {
				return container.resolve(file);
			};
		}

		await this.start();
		await this.uploadCommands();
		container.get(Papr).start(process.env.MONGO_URI);
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
			GOOGLE_AI_KEY_1: string;
			GOOGLE_AI_KEY_2: string;
			GOOGLE_AI_KEY_3: string;
			GOOGLE_AI_KEY_4: string;
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
