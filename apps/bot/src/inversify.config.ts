import { Container, decorate, injectable } from "inversify";
import { Hiraku } from "./lib/structures/hiraku";
import { Client, Command, SubCommand } from "seyfert";
import { GuildService, ImageHistoryService, UserService } from "@repo/database";
import { RedisClient } from "./lib/structures/redis";
import { BullModule } from "@repo/bull";
import { DalleQueue } from "./lib/jobs/image/dalle.queue";
import { AnimeQueue } from "./lib/jobs/image/anime.queue";
import { ImageProducer } from "./lib/jobs/image/image.producer";
import { ProdiaQueue } from "./lib/jobs/image/prodia.queue";
import { MonthlyReset } from "./lib/tasks/monthlyReset";

const container = new Container({ skipBaseClassChecks: true });

decorate(injectable(), Client);
decorate(injectable(), Command);
decorate(injectable(), SubCommand);

// Singleton bindings
container.bind(Hiraku).toSelf().inSingletonScope();
container.bind(RedisClient).toSelf().inSingletonScope();
container.bind(BullModule).toSelf().inSingletonScope();

// Services
container.bind(UserService).toSelf();
container.bind(GuildService).toSelf();
container.bind(ImageHistoryService).toSelf();

container.get(BullModule).register(
	{
		queues: [DalleQueue, AnimeQueue, ProdiaQueue],
		producers: [ImageProducer],
	},
	container
);

container.resolve(MonthlyReset);
export { container };
