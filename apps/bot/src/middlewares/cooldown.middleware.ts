import { createMiddleware } from "seyfert";
import { constants } from "../lib/constants";

const cooldowns = new Map<string, number>();
const BASE_COOLDOWN = 1000 * 10;

export const cooldownMiddleware = createMiddleware<void>((middle) => {
	if (constants.DEVS.includes(middle.context.author.id)) return middle.next();

	const cooldown = cooldowns.get(middle.context.author.id);
	if (!cooldown) {
		cooldowns.set(middle.context.author.id, Date.now() + BASE_COOLDOWN);
		return middle.next();
	}

	if (Date.now() < cooldown) {
		return middle.stop(`You are on cooldown! Please wait ${Math.ceil((cooldown - Date.now()) / 1000)} seconds`);
	}

	cooldowns.set(middle.context.author.id, Date.now() + BASE_COOLDOWN);

	middle.next();
});
