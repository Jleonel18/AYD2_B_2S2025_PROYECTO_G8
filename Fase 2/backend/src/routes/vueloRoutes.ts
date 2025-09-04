import { Router } from 'express';
import { VueloController } from '../modules/flights/controllers/vueloController';
import { VueloService } from '../core/repository/services/VueloService';
import { VueloRepository } from '../core/repository/repositories/VueloRepository';


const vueloRepository = new VueloRepository();
const vueloService = new VueloService(vueloRepository);
const vueloController = new VueloController(vueloService);

export class VueloRoutes {
    public router: Router;  

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post("/", vueloController.crearVuelo);
        this.router.get("/", vueloController.listarVuelos);
        this.router.get("/:id", vueloController.obtenerVuelo);
        this.router.put("/:id", vueloController.actualizarEstadoVuelo);
        this.router.put("/:id", vueloController.cancelarVuelo);
    }
}