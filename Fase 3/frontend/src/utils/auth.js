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

export function getRolUser() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.tipo;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

export function isAuthenticated() {
    return !!sessionStorage.getItem('token');
}
