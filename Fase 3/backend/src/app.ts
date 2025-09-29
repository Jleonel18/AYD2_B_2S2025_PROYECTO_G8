import "dotenv/config.js";
import express, { Application, Request, Response } from "express";
import { connectDB } from "./config/database.js";
import { UsuarioRoutes } from "./routes/usuarioRoutes.js";
import { AvionRoutes } from "./routes/avionRoutes.js";
import { VueloRoutes } from "./routes/vueloRoutes.js";
import { AeropuertoRoutes } from "./routes/aeropuertoRoutes.js";
import cors from "cors";
import { ReservaRoutes } from "./routes/reservaRoutes.js";
import { flotaService } from "./core/repository/services/FlotaService.js";
import { notificacionService } from "./core/repository/services/NotificacionService.js";


const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use(express.json());

// Ruta raíz
app.get("/api/", (req: Request, res: Response) => {
    res.send("🚀 Servidor funcionando con Singleton en la DB y patrón Repository!");
});

flotaService.initListener().catch(console.error);

// Rutas de usuarios
const usuarioRoutes = new UsuarioRoutes();
app.use("/api/users", usuarioRoutes.router);

// Rutas de aviones
const avionRoutes = new AvionRoutes();
app.use("/api/aviones", avionRoutes.router);

// Rutas de vuelos
const vueloRoutes = new VueloRoutes();
app.use("/api/vuelos", vueloRoutes.router);

//Rutas de aeropuertos
const aeropuertoRoutes = new AeropuertoRoutes();
app.use("/api/aeropuertos", aeropuertoRoutes.router);

// Rutas de reservas
const reservaRoutes = new ReservaRoutes();
app.use("/api/reservas", reservaRoutes.router);

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
