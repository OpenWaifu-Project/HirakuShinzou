import { Logger as MainLogger } from "@repo/logger";
import { Logger as SeyfertLogger } from "seyfert";

export class HirakuLogger extends SeyfertLogger {
	private logger = new MainLogger("Hiraku");

	info(message: unknown) {
		this.logger.info(message);
	}

	error(message: unknown) {
		this.logger.error(message);
	}

	warn(message: unknown) {
		this.logger.warn(message);
	}
}
