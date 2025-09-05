import {Router } from "express";
import { AeropuertoController } from "../modules/airports/controllers/AeropuertoController";
import { AeropuertoService } from "../core/repository/services/AeropuertoService";
import { AeropuertoRepository } from "../core/repository/repositories/AeropuertoRepository";

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
        this.router.post("/", aeropuertoController.crearAeropuerto);
        
        this.router.get("/", aeropuertoController.obtenerTodosLosAeropuertos);
        
        this.router.get("/:id", aeropuertoController.obtenerAeropuertoPorId);
        
        this.router.put("/:id", aeropuertoController.actualizarAeropuerto);
        
        this.router.delete("/:id", aeropuertoController.eliminarAeropuerto);
    }
}