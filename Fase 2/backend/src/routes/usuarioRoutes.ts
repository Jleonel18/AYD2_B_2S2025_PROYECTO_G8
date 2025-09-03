import { Router } from "express";
import { UsuarioController } from "../modules/users/controllers/usuarioController";
import { UserService } from "../core/repository/services/UserService";
import { UserRepository } from "../core/repository/repositories/UserRepository";

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
        this.router.get("/:id", usuarioController.obtenerUsuario);
    }
}
