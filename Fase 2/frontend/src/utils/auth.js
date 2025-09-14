export function getUserInfo() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.id,
            usuario: payload.usuario,
            tipo: payload.tipo,
            nombre: payload.nombre,
            correo: payload.correo
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}
