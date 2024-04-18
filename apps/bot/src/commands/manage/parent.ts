import { AutoLoad, Command, Declare, Groups, Middlewares } from "seyfert";

@Declare({
	name: "manage",
	description: "Manage commands",
	defaultMemberPermissions: ["ManageGuild"],
	contexts: ["GUILD"],
})
@AutoLoad()
@Middlewares(["prepare"])
@Groups({
	image: {
		defaultDescription: "Manage image module",
	},
	chat: {
		defaultDescription: "Manage chat module",
	},
})
export default class ManageCommand extends Command {}
