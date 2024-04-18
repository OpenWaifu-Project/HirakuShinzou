import { AutoLoad, Command, Declare, Middlewares } from "seyfert";

@Declare({
	name: "util",
	description: "Utility commands",
	contexts: ["GUILD"],
})
@AutoLoad()
@Middlewares(["prepare"])
export default class UtilCommand extends Command {}
