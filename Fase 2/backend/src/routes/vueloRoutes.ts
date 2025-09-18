import { Router } from 'express';
import { VueloController } from '../modules/flights/controllers/vueloController.js';
import { VueloService } from '../core/repository/services/VueloService.js';
import { VueloRepository } from '../core/repository/repositories/VueloRepository.js';
import { AvionService } from '../core/repository/services/AvionService.js';
import { AvionRepository } from '../core/repository/repositories/AvionRepository.js';
import { authorizeRoles, tokenAuth } from '../middleware/authMiddleware.js';
import { ReservaService } from '../core/repository/services/ReservaService.js';
import { ReservaRepository } from '../core/repository/repositories/ReservaRepository.js';
import { UserRepository } from '../core/repository/repositories/UserRepository.js';
import { UserService } from '../core/repository/services/UserService.js';


const vueloRepository = new VueloRepository();
const vueloService = new VueloService(vueloRepository);
const avionRepository = new AvionRepository();
const avionService = new AvionService(avionRepository);
const reservaRepository = new ReservaRepository();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const reservaService = new ReservaService(reservaRepository, userService);
const vueloController = new VueloController(vueloService, avionService, reservaService, userService);

export class VueloRoutes {
    public router: Router;  

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post("/", tokenAuth, authorizeRoles("operaciones"), vueloController.crearVuelo);
        this.router.get("/", vueloController.listarVuelos);
        this.router.get("/:id", vueloController.obtenerVuelo);
        this.router.put("/:id", vueloController.actualizarEstadoVuelo);
        this.router.patch("/:id", tokenAuth, authorizeRoles("operaciones"), vueloController.cancelarVuelo);
    }
}