import { Router } from "express";
import { AvionController } from "../modules/airplanes/controllers/avionController";
import { AvionService } from "../core/repository/services/AvionService";
import { AvionRepository } from "../core/repository/repositories/AvionRepository";

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
        this.router.post("/", avionController.crearAvion);
        
        this.router.get("/", avionController.obtenerTodosLosAviones);
        
        this.router.get("/:id", avionController.obtenerAvionPorId);
        
        this.router.put("/:id", avionController.actualizarAvion);
        
        this.router.delete("/:id", avionController.eliminarAvion);
    }
}