import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { flotaService } from "./core/repository/services/FlotaService.js";
import { notificacionService } from "./core/repository/services/NotificacionService.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
        try {
            await connectDB();
            await flotaService.initListener();
            await notificacionService.initListener();
            app.listen(PORT, () => {
                console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
            });
        } catch (error) {
            console.error("❌ No se pudo iniciar el servidor:", error);
            process.exit(1);
        }
    };

    // Solo inicia el servidor si no estamos en pruebas
    if (process.env.NODE_ENV !== "test") {
        startServer();
    }