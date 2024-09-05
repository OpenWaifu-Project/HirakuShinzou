import { schema, types } from "papr";

const UserSchema = schema(
	{
		_id: types.string({ required: true }),
		lastVote: types.number({ required: true }),
		voteStreak: types.number({ required: true }),
		membership: types.object(
			{
				plan: types.string({ required: true }),
				since: types.number({ required: true }),
				expires: types.number({ required: true }),
			},
			{ required: true }
		),
		tokens: types.object(
			{
				image: types.number({ required: true }),
				chat: types.number({ required: true }),
			},
			{ required: true }
		),
		multiplier: types.number({ required: true }),
		imageHistory: types.array(types.objectId({ required: true })),
		imageTags: types.array(
			types.object({
				prompt: types.string({ required: true }),
				tag: types.string({ required: true }),
			}),
			{ required: true }
		),
		settings: types.object(
			{
				image: types.object({
					history: types.boolean({ required: true }),
				}),
			},
			{ required: true }
		),
	},
	{
		defaults: {
			lastVote: 0,
			voteStreak: 0,
			membership: {
				plan: "Free",
				since: Date.now(),
				expires: Date.now() + 2592000000,
			},
			tokens: {
				image: 10,
				chat: 5,
			},
			multiplier: 1,
			imageHistory: [],
			imageTags: [],
			settings: {
				image: {
					history: true,
				},
			},
		},
	}
);

export type UserDocument = (typeof UserSchema)[0];

export { UserSchema };
