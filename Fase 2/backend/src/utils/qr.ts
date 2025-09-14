import QRCode from 'qrcode';

export async function generarCodigoQR(data: string): Promise<string> {
    try {
        const url = `${process.env.FRONTEND_URL}/reserva/${data}`;
        const qrCodeDataURL = await QRCode.toDataURL(url);
        return qrCodeDataURL;
    } catch (error) {
        console.error("Error al generar el código QR:", error);
        throw new Error("No se pudo generar el código QR");
    }
}