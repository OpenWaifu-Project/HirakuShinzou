import { schema, types } from "papr";

const ImageHistorySchema = schema(
	{
		prompt: types.string({ required: true }),
		negativePrompt: types.string(),
		width: types.number({ required: true }),
		height: types.number({ required: true }),
		genType: types.string({ required: true }),
		url: types.string({ required: true }),
		model: types.string({ required: true }),
		userId: types.string({ required: true }),
		createdAt: types.date(),
	},
	{
		defaults: {
			createdAt: new Date(),
		},
	}
);

export type ImageHistoryDocument = (typeof ImageHistorySchema)[0];

export { ImageHistorySchema };
