import { Redis } from "ioredis";
import { injectable } from "inversify";

@injectable()
class RedisClient extends Redis {
	constructor() {
		super({
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT),
		});
	}
}

export { RedisClient };
