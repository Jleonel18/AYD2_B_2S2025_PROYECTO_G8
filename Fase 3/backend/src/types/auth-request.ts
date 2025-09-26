interface AuthRequest extends Request {
    user: {
        id: string,
        usuario: string,
        tipo: string,
        nombre: string,
        correo: string
    };
}

export { AuthRequest };