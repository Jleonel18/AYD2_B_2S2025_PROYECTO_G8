import { Router } from "express";
import { AvionController } from "../modules/airplanes/controllers/avionController.js";
import { AvionService } from "../core/repository/services/AvionService.js";
import { AvionRepository } from "../core/repository/repositories/AvionRepository.js";
import { tokenAuth, authorizeRoles } from "../middleware/authMiddleware.js";
import { VueloService } from "../core/repository/services/VueloService.js";
import { VueloRepository } from "../core/repository/repositories/VueloRepository.js";

const avionRepository = new AvionRepository();
const avionService = new AvionService(avionRepository);
const vueloRepository = new VueloRepository();
const vueloService = new VueloService(vueloRepository);
const avionController = new AvionController(avionService,vueloService);

export class AvionRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", tokenAuth, authorizeRoles("operaciones"), avionController.crearAvion);

        this.router.get("/", tokenAuth, avionController.obtenerTodosLosAviones);

        this.router.get("/:id", avionController.obtenerAvionPorId);

        this.router.put("/:id", tokenAuth, authorizeRoles("operaciones"), avionController.actualizarAvion);

        this.router.delete("/:id", tokenAuth, authorizeRoles("operaciones"), avionController.eliminarAvion);

        this.router.patch("/:id/horas-vuelo", avionController.sumarHorasVuelo);

        this.router.get("/estadoHoras/:id", avionController.verificarHorasVuelo);
        
    }
}