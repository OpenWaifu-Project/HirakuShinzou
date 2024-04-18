// @see https://stackoverflow.com/a/49725198
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
	}[Keys];

export type BullQueueEvent =
	| "error"
	| "waiting"
	| "active"
	| "stalled"
	| "progress"
	| "completed"
	| "failed"
	| "paused"
	| "resumed"
	| "cleaned"
	| "drained"
	| "removed"
	| "global:error"
	| "global:waiting"
	| "global:active"
	| "global:stalled"
	| "global:progress"
	| "global:completed"
	| "global:failed"
	| "global:paused"
	| "global:resumed"
	| "global:cleaned"
	| "global:drained"
	| "global:removed";
//
// IDK if I going to use this in a future
//
// export type BullQueueEventOptions = RequireOnlyOne<
// 	{
// 		eventName: BullQueueEvent;
// 		name?: string;
// 		id?: string;
// 	},
// 	"id" | "name"
// >;
//
// export type QueueEventDecoratorOptions = RequireOnlyOne<
// 	{ id?: string; name?: string },
// 	"id" | "name"
// >;
