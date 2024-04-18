import { UserService } from "@repo/database";
import { injectable } from "inversify";
import cron from "node-cron";

@injectable()
export class MonthlyReset {
	constructor(private userService: UserService) {
		cron.schedule("0 0 1 * *", this.userService.bulkUpdateMonthly.bind(this.userService));
	}
}
