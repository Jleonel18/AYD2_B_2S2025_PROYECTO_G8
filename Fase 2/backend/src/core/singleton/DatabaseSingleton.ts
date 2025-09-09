import mongoose from "mongoose";

export class DatabaseSingleton {
    private static instance: DatabaseSingleton;

    private constructor() {}

    public static getInstance(): DatabaseSingleton {
        if (!DatabaseSingleton.instance) {
            DatabaseSingleton.instance = new DatabaseSingleton();
        }
        return DatabaseSingleton.instance;
    }

    public async connect(uri: string): Promise<void> {
        try {
            await mongoose.connect(uri);
            console.log("✅ Conectado a MongoDB");
        } catch (error) {
            console.error("❌ Error al conectar a MongoDB:", error);
            throw new Error("No se pudo conectar a la base de datos");
        }
    }
}
