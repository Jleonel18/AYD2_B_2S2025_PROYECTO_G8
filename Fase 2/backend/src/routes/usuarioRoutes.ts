import { Router } from "express";
import { UsuarioController } from "../modules/users/controllers/usuarioController";
import { UserService } from "../core/repository/services/UserService";
import { UserRepository } from "../core/repository/repositories/UserRepository";
import { authorizeRoles, tokenAuth } from "../middleware/authMiddleware";

// Aquí instanciamos dependencias
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const usuarioController = new UsuarioController(userService);

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
        this.router.patch("/pilotos/:id/horas-vuelo", tokenAuth, authorizeRoles('operaciones'), usuarioController.sumarHorasVueloPiloto);
        this.router.patch("/pasajeros/puntos", tokenAuth, authorizeRoles("operaciones"), usuarioController.sumarPuntosPorHorasVuelo);

    }
}
