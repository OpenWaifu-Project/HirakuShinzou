import { inject } from "inversify";
import { BULL_MODULE_ON_QUEUE_EVENT, BULL_MODULE_QUEUE, BULL_MODULE_QUEUE_PROCESS } from "./constants";
import type { BullQueueEvent } from "./types";

export enum BullQueueEvents {
	ERROR = "error",
	WAITING = "waiting",
	ACTIVE = "active",
	STALLED = "stalled",
	PROGRESS = "progress",
	COMPLETED = "completed",
	FAILED = "failed",
	PAUSED = "paused",
	RESUMED = "resumed",
	CLEANED = "cleaned",
	DRAINED = "drained",
	REMOVED = "removed",
}

export enum BullQueueGlobalEvents {
	ERROR = "global:error",
	WAITING = "global:waiting",
	ACTIVE = "global:active",
	STALLED = "global:stalled",
	PROGRESS = "global:progress",
	COMPLETED = "global:completed",
	FAILED = "global:failed",
	PAUSED = "global:paused",
	RESUMED = "global:resumed",
	CLEANED = "global:cleaned",
	DRAINED = "global:drained",
	REMOVED = "global:removed",
}

const OnQueueEvent = (eventNameOrOptions: BullQueueEvent): MethodDecorator => {
	return (target, key) => {
		Reflect.defineMetadata(BULL_MODULE_ON_QUEUE_EVENT, { eventName: eventNameOrOptions }, target, key);
	};
};

function getQueueToken(name?: string): string {
	return name ? `BullQueue_${name}` : "BullQueue_default";
}

// DECORATORS
export const InjectQueue = (name?: string): ParameterDecorator => inject(getQueueToken(name));

export const QueueListener = (eventName: keyof typeof BullQueueEvents) => {
	return OnQueueEvent(BullQueueEvents[eventName]);
};

export function Processor(queueName: string): ClassDecorator {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	return (target: Function) => {
		Reflect.defineMetadata(BULL_MODULE_QUEUE, { name: queueName }, target);
	};
}

export function Process(name?: string): MethodDecorator {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return (target: object, key?: any) => {
		Reflect.defineMetadata(BULL_MODULE_QUEUE_PROCESS, name ? { name } : {}, target, key);
	};
}
