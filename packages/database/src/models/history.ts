import { Schema, model } from "mongoose";

export interface imageHistoryI {
	prompt: string;
	negativePrompt: string;
	width: number;
	height: number;
	genType: string;
	url: string;
	date: number;
	user: string;
	model: string;
}

const imageHistorySchema = new Schema<imageHistoryI>({
	prompt: String,
	negativePrompt: String,
	width: Number,
	height: Number,
	genType: String,
	url: String,
	model: String,
	date: { type: Number, default: () => Date.now() },
	user: { type: String, ref: "User" },
});

export const imageHistoryModel = model<imageHistoryI>("ImageHistory", imageHistorySchema);
