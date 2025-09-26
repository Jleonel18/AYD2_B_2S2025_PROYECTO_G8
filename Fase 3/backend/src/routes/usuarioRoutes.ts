import { Router } from "express";
import { UsuarioController } from "../modules/users/controllers/usuarioController.js";
import { UserService } from "../core/repository/services/UserService.js";
import { UserRepository } from "../core/repository/repositories/UserRepository.js";
import { authorizeRoles, tokenAuth } from "../middleware/authMiddleware.js";
import { VueloRepository } from "../core/repository/repositories/VueloRepository.js";
import { VueloService } from "../core/repository/services/VueloService.js";
import { AvionRepository } from "../core/repository/repositories/AvionRepository.js";
import { AvionService } from "../core/repository/services/AvionService.js";

// Aquí instanciamos dependencias
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const vueloRepository = new VueloRepository();
const vueloService = new VueloService(vueloRepository);
const avionRepository = new AvionRepository();
const avionesService = new AvionService(avionRepository);
const usuarioController = new UsuarioController(userService, vueloService, avionesService);

export class UsuarioRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/", usuarioController.crearUsuario);
        this.router.get("/", tokenAuth, usuarioController.obtenerUsuario);
        this.router.get("/trabajadores", tokenAuth, authorizeRoles('operaciones'), usuarioController.obtenerTrabajadores);
        this.router.get("/trabajadores/:id", tokenAuth, authorizeRoles('operaciones'), usuarioController.obtenerTrabajadorPorId);
        this.router.put("/trabajadores/:id", tokenAuth, authorizeRoles('operaciones'), usuarioController.actualizarTrabajador);
        this.router.delete("/trabajadores/:id", tokenAuth, authorizeRoles('operaciones'), usuarioController.eliminarTrabajador);
        this.router.post("/verificar", usuarioController.verificarCorreoGuardarPass)
        this.router.post("/login", usuarioController.login)
        this.router.put("/perfil", tokenAuth, authorizeRoles('pasajero'), usuarioController.editarPerfil)
        this.router.post("/recuperar-password", usuarioController.solicitarTokenRecuperacion)
        this.router.post("/verificar-password", usuarioController.verificarYRestablecerContrasena)
        this.router.patch("/pilotos/:id/horas-vuelo", usuarioController.sumarHorasVueloPiloto);
        this.router.patch("/pasajeros/puntos", tokenAuth, authorizeRoles("operaciones"), usuarioController.sumarPuntosPorHorasVuelo);
        this.router.get("/historial-vuelos", tokenAuth, usuarioController.obtenerHistorialVuelos);
        this.router.get("/estadisticas", tokenAuth, authorizeRoles("operaciones"), usuarioController.obtenerEstadisticasAdmin);
        this.router.get("/pasajeros", tokenAuth, authorizeRoles('operaciones'), usuarioController.obtenerPasajeros);
        this.router.patch("/:id/estado", tokenAuth, authorizeRoles('operaciones', 'pasajero'), usuarioController.editarEstadoUsuario);
    }
}
