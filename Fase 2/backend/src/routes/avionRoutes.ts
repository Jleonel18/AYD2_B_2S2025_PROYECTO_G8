import { Router } from "express";
import { AvionController } from "../modules/airplanes/controllers/avionController";
import { AvionService } from "../core/repository/services/AvionService";
import { AvionRepository } from "../core/repository/repositories/AvionRepository";
import { tokenAuth, authorizeRoles } from "../middleware/authMiddleware";

const avionRepository = new AvionRepository();
const avionService = new AvionService(avionRepository);
const avionController = new AvionController(avionService);

export class AvionRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", tokenAuth, authorizeRoles("operaciones"), avionController.crearAvion);

        this.router.get("/", tokenAuth, avionController.obtenerTodosLosAviones);

        this.router.get("/:id", tokenAuth, avionController.obtenerAvionPorId);

        this.router.put("/:id", tokenAuth, authorizeRoles("operaciones"), avionController.actualizarAvion);

        this.router.delete("/:id", tokenAuth, authorizeRoles("operaciones"), avionController.eliminarAvion);
    }
}