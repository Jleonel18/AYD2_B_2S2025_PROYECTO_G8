import {Router } from "express";
import { AeropuertoController } from "../modules/airports/controllers/aeropuertoController";
import { AeropuertoService } from "../core/repository/services/AeropuertoService";
import { AeropuertoRepository } from "../core/repository/repositories/AeropuertoRepository";
import { tokenAuth, authorizeRoles } from "../middleware/authMiddleware";

const aeropuertoRepository = new AeropuertoRepository();
const aeropuertoService = new AeropuertoService(aeropuertoRepository);
const aeropuertoController = new AeropuertoController(aeropuertoService);

export class AeropuertoRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", tokenAuth, authorizeRoles("operaciones"), aeropuertoController.crearAeropuerto);

        this.router.get("/", tokenAuth, aeropuertoController.obtenerTodosLosAeropuertos);

        this.router.get("/:id", aeropuertoController.obtenerAeropuertoPorId);

        this.router.put("/:id", tokenAuth, authorizeRoles("operaciones"), aeropuertoController.actualizarAeropuerto);

        this.router.delete("/:id", tokenAuth, authorizeRoles("operaciones"), aeropuertoController.eliminarAeropuerto);
    }
}