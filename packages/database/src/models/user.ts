import { Schema, model } from "mongoose";

export interface UserSchemaI {
	_id: string;
	lastVote: number;
	voteStreak: number;
	membership: {
		plan: string;
		since: number;
		expires: number;
	};
	tokens: {
		image: number;
		chat: number;
	};
	multiplier: number;
	stats: {
		images: number;
		imageHistory: Schema.Types.ObjectId[];
	};
	imageTags: {
		prompt: string;
		tag: string;
	}[];
	settings: {
		image: {
			history: boolean;
		};
	};
}

const userSchema = new Schema<UserSchemaI>({
	_id: String,
	lastVote: { type: Number, default: 0 },
	voteStreak: { type: Number, default: 0 },
	membership: {
		plan: { type: String, default: "Free" },
		since: { type: Number, default: () => Date.now() },
		expires: { type: Number, default: () => Date.now() + 2592000000 },
	},
	tokens: {
		image: { type: Number, default: 10 },
		chat: { type: Number, default: 5 },
	},
	multiplier: { type: Number, default: 1 },
	stats: {
		images: { type: Number, default: 0 },
		imageHistory: [{ type: Schema.Types.ObjectId, ref: "ImageHistory" }],
	},
	imageTags: {
		type: Array<{
			prompt: string;
			tag: string;
		}>(),
		default: [],
	},
	settings: {
		image: {
			history: { type: Boolean, default: true },
		},
	},
});

export const userModel = model<UserSchemaI>("User", userSchema);
