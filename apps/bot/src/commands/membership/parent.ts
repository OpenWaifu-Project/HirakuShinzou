import { AutoLoad, Command, Declare, Middlewares } from "seyfert";

@Declare({
	name: "membership",
	description: "Membership commands",
	contexts: ["GUILD"],
})
@AutoLoad()
@Middlewares(["prepare"])
export default class MembershipCommand extends Command {}
