import crypto from 'crypto';

function eliminarAcentos(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function generarUsuario(nombreCompleto: string): string {
    const partes = nombreCompleto.trim().split(/\s+/);
    const inicial = partes[0][0].toLowerCase();
    const apellido = partes.length > 1 ? partes[partes.length - 1].toLowerCase() : partes[0].toLowerCase();
    const apellidoClean = eliminarAcentos(apellido).replace(/[^a-z0-9]/g, '');
    const random = Math.floor(Math.random() * 10000);
    return `${inicial}${apellidoClean}_${random}`;
}

function generarTokenVerificacion(): string {
    return crypto.randomBytes(32).toString('hex');
}

export { generarUsuario, generarTokenVerificacion };