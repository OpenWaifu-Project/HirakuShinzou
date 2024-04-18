import "reflect-metadata";
import { BULL_MODULE_ON_QUEUE_EVENT, BULL_MODULE_QUEUE, BULL_MODULE_QUEUE_PROCESS } from "./constants";
import { type Container, injectable } from "inversify";
import { buildQueue, getQueueToken } from "./utils";
import { Logger } from "@repo/logger";

interface RegisterQueues {
	// biome-ignore format: this shouldn't be formatted
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	queues: (new (..._args: any[]) => any)[];
	// biome-ignore format: the array should not be formatted
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	producers: (new (..._args: any[]) => any)[];
}

@injectable()
export class BullModule {
	config = {
		redis: {
			host: "localhost",
			port: 6379,
		},
	};

	private logger = new Logger("BullModule");

	/**
	 * How it works?
	 *
	 * It receives and object with the queues and producers to be registered. (The classes not the instances)
	 * Then it will retrieve the queue name metadata from the queue class and create a new Bull (queue) instance.
	 * After that, it will bind the queue instance to the inversify container.
	 * Then it will retrieve the methods from the queue class that have the BULL_MODULE_QUEUE_PROCESS metadata and bind them to the queue instance.
	 * Also it will retrieve the events from the queue class that have the BULL_MODULE_ON_QUEUE_EVENT metadata and bind them to the queue instance.
	 * Finally, it will bind the producers to the inversify container.
	 *
	 */
	register(data: RegisterQueues, container: Container) {
		for (const queueClass of data.queues) {
			const queue_data = Reflect.getMetadata(BULL_MODULE_QUEUE, queueClass);
			if (!queue_data) {
				continue;
			}

			const queue = buildQueue({
				name: queue_data.name,
				redis: this.config.redis,
			});

			this.logger.info(`Registering queue:${queue_data.name}`);

			const token = getQueueToken(queue_data.name);
			const queueInstance = container.resolve(queueClass);
			container.bind(token).toConstantValue(queue);

			const methods = Object.getOwnPropertyNames(queueClass.prototype).filter((method) =>
				Reflect.getMetadata(BULL_MODULE_QUEUE_PROCESS, queueClass.prototype, method)
			);

			for (const method of methods) {
				const processName = Reflect.getMetadata(BULL_MODULE_QUEUE_PROCESS, queueClass.prototype, method);

				if (processName.name) {
					queue.process(processName.name, queueInstance[method].bind(queueInstance));
				} else {
					queue.process(queueInstance[method].bind(queueInstance));
				}

				this.logger.info(`Registering queue process:${queue_data.name}:${processName.name || "default"}`);
			}

			const events = Object.getOwnPropertyNames(queueClass.prototype).filter((event) =>
				Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, queueClass.prototype, event)
			);

			for (const event of events) {
				const data = Reflect.getMetadata(BULL_MODULE_ON_QUEUE_EVENT, queueClass.prototype, event);

				queue.on(data.eventName, queueInstance[event].bind(queueInstance));
				this.logger.info(`Registering queue event:${queue_data.name}:${data.eventName}`);
			}
		}
		for (const producer of data.producers) {
			container.bind(producer).to(producer).inSingletonScope();
			this.logger.info(`Registering producer:${producer.name}`);
		}
	}
}
