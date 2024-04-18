import { Schema, model } from "mongoose";

export interface GuildSchemaI {
	_id: string;
	settings: {
		image: {
			channel: string | null;
			blur: boolean;
			status: boolean;
			filter: boolean;
		};
		chat: {
			channel: string | null;
			onlychannel: boolean;
			status: boolean;
		};
		language: "en" | "es";
	};
}

const guildSchema = new Schema<GuildSchemaI>({
	_id: String,
	settings: {
		image: {
			channel: { type: String, default: null },
			blur: { type: Boolean, default: true },
			status: { type: Boolean, default: true },
			filter: { type: Boolean, default: true },
		},
		chat: {
			channel: { type: String, default: null },
			onlyChannel: { type: Boolean, default: false },
			status: { type: Boolean, default: true },
		},
		language: { type: String, default: "en" },
	},
});

export const guildModel = model<GuildSchemaI>("Guild", guildSchema);
