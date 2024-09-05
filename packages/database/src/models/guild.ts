import { schema, types } from "papr";
const GuildSchema = schema(
	{
		_id: types.string({ required: true }),
		imageSettings: types.object(
			{
				channel: types.oneOf([types.string(), types.null()]),
				blur: types.boolean(),
				status: types.boolean(),
				filter: types.boolean(),
			},
			{ required: true }
		),
		chatSettings: types.object(
			{
				channel: types.oneOf([types.string(), types.null()]),
				onlyChannel: types.boolean(),
				status: types.boolean(),
			},
			{ required: true }
		),
		language: types.string({ required: true }),
	},
	{
		defaults: {
			imageSettings: {
				blur: true,
				status: true,
				filter: true,
			},
			chatSettings: {
				onlyChannel: false,
				status: true,
			},
			language: "en",
		},
	}
);

export type GuildDocument = (typeof GuildSchema)[0];
export type GuildOptions = (typeof GuildSchema)[1];

export { GuildSchema };
