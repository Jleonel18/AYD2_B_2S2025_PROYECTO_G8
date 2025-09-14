import { Router } from 'express';
import { ReservaController } from '../modules/reservation/controller/reservationController';
import { authorizeRoles, tokenAuth } from '../middleware/authMiddleware';
import { ReservaService } from '../core/repository/services/ReservaService';
import { ReservaRepository } from '../core/repository/repositories/ReservaRepository';
import { ReservaFacade } from '../core/facade/ReservaFacade';
import { VueloRepository } from '../core/repository/repositories/VueloRepository';
import { AvionRepository } from '../core/repository/repositories/AvionRepository';
import { VueloService } from '../core/repository/services/VueloService';
import { AvionService } from '../core/repository/services/AvionService';
import { UserService } from '../core/repository/services/UserService';
import { UserRepository } from '../core/repository/repositories/UserRepository';

const reservaRepository = new ReservaRepository();
const vueloRepository = new VueloRepository();
const vueloService = new VueloService(vueloRepository);
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const reservaService = new ReservaService(reservaRepository, userService);
const avionRepository = new AvionRepository();
const avionService = new AvionService(avionRepository);
const reservaFacade = new ReservaFacade(vueloService, avionService, reservaService);
const reservaController = new ReservaController(reservaFacade, userService, vueloService);


export class ReservaRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", tokenAuth, authorizeRoles('pasajero'), reservaController.crearReserva);
        this.router.get("/:id", tokenAuth, reservaController.obtenerReserva);
        this.router.get("/", tokenAuth, authorizeRoles('pasajero'), reservaController.listarReservasPorUsuario);
        this.router.put("/:id", tokenAuth, authorizeRoles('pasajero'), reservaController.eliminarReserva);
        this.router.get("/vuelo/:id_vuelo", tokenAuth, reservaController.listarReservasPorVuelo);
        this.router.post("/checkin/:id", tokenAuth, authorizeRoles('pasajero'), reservaController.hacerCheckIn);
        this.router.post("/actualizar-estado/:id", tokenAuth, authorizeRoles('operaciones'), reservaController.cambiarEstadoReserva);
        this.router.get("/asientos-reservados/:id_vuelo", tokenAuth, reservaController.obtenerAsientosReservados);
    }
}