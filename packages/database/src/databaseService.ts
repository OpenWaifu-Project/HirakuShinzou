import mongoose from "mongoose";

async function startDB(mongoURI: string) {
	await mongoose.connect(mongoURI);
}

export { startDB };
