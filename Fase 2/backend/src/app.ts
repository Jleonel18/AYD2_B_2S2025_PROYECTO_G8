import 'dotenv/config';
import express, { Application, Request, Response } from "express";
import { connectDB } from "./config/database.js";
import { UserService } from './services/UserService';

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Instancia del servicio (usará el repository internamente)
const userService = new UserService();

app.get("/", (req: Request, res: Response) => {
    res.send("🚀 Servidor funcionando con Singleton en la DB y patrón Repository!");
});

// Ruta para crear un usuario
app.post('/users', async (req: Request, res: Response) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Ruta para obtener un usuario por ID
app.get('/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
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