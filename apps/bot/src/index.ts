import "reflect-metadata";

import { container } from "./inversify.config";
import { Hiraku } from "./lib/structures/hiraku";

(async () => {
	await container.get(Hiraku).init();
})();
