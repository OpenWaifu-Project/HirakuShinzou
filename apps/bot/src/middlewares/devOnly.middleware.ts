import { createMiddleware } from "seyfert";
import { constants } from "../lib/constants";

export const devOnlyMiddleware = createMiddleware<void>((middle) => {
	if (!constants.DEVS.includes(middle.context.author.id)) middle.stop("You are not a developer!");

	middle.next();
});
