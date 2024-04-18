import chalk from "chalk";
import { injectable } from "inversify";

@injectable()
export class Logger {
	constructor(private name: string) {}

	private formatRSS() {
		return `${Math.floor(process.memoryUsage().rss / 1024 / 1024)} MB`;
	}

	formatTime() {
		const date = new Date();
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");

		return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
	}

	info(message: unknown) {
		console.log(
			`${chalk.gray(this.formatTime())} ${chalk.bgCyan.black(" INFO ")} ${chalk.green.bold(this.name)} ${chalk.magenta(
				this.formatRSS()
			)} ${message}`
		);
	}

	error(message: unknown) {
		console.log(
			`${chalk.gray(this.formatTime())} ${chalk.bgRed.black(" ERROR ")} ${chalk.green.bold(this.name)} ${chalk.magenta(
				this.formatRSS()
			)} ${message}`
		);
	}

	warn(message: unknown) {
		console.log(
			`${chalk.gray(this.formatTime())} ${chalk.bgYellow.black(" WARN ")} ${chalk.green.bold(
				this.name
			)} ${chalk.magenta(this.formatRSS())} ${message}`
		);
	}
}
