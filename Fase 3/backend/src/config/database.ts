import { DatabaseSingleton } from "../core/singleton/DatabaseSingleton.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI no está definido en .env");
}

export const connectDB = async (): Promise<void> => {
    const db = DatabaseSingleton.getInstance();
    await db.connect(MONGO_URI);
};
