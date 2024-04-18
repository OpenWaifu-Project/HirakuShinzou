import Bull from "bull";

export interface BullRootModuleOptions extends Bull.QueueOptions {
	/**
	 * Redis client connection string
	 */
	url?: string;
}

export interface BullModuleOptions extends BullRootModuleOptions {
	/**
	 * Queue name
	 *
	 * @default default
	 */
	name?: string;
}
export function buildQueue(options: BullModuleOptions): Bull.Queue {
	const queueName = options.name ? options.name : "default";
	const queue: Bull.Queue = options?.url ? new Bull(queueName, options.url, options) : new Bull(queueName, options);

	return queue;
}

export function getQueueToken(name?: string): string {
	return name ? `BullQueue_${name}` : "BullQueue_default";
}
