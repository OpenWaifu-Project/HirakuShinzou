import { AutoLoad, Command, Declare, Middlewares } from "seyfert";

@Declare({
	name: "info",
	description: "Info commands",
	contexts: ["Guild"],
})
@AutoLoad()
@Middlewares(["prepare"])
export default class InfoCommand extends Command {}
