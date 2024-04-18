import { loggerMiddleware } from "./logger.middleware";
import { cooldownMiddleware } from "./cooldown.middleware";
import { prepareMiddleware } from "./prepare.middleware";
import { devOnlyMiddleware } from "./devOnly.middleware";
import { container } from "../inversify.config";

export const allMiddlewares = {
	logger: loggerMiddleware,
	cooldown: cooldownMiddleware,
	prepare: container.resolve(prepareMiddleware).middleware,
	devOnly: devOnlyMiddleware,
} as const;
