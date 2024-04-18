import { Watcher } from "seyfert";
import { join } from "path";

async function start() {
	const ws = new Watcher({
		filePath: join(process.cwd(), "dist", "index.js"),
		srcPath: join(process.cwd(), "src"),
		transpileCommand: "tsc",
	});

	await ws.spawnShards();
}

start();
