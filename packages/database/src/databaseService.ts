import mongoose from "mongoose";

async function startDB() {
	await mongoose.connect(process.env.MONGO_URI!);
}

export { startDB };
