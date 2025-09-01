import 'dotenv/config';
import express from "express";
import { connectDB } from "./config/database.js";
import type { Application, Request, Response } from "express";

// dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("🚀 Servidor funcionando con Singleton en la DB!");
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
        console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ No se pudo iniciar el servidor:", error);
    }
};

startServer();
