import nodemailer from 'nodemailer'

interface EnviarCorreoParams {
    correoDestino: string;
    nombre: string;
    token: string;
    usuario: string
}

interface EnviarCorreoCancelacionParams {
    correoDestino: string;
    nombre: string;
    reservaId: string;
    codigo_reserva: string;
}

interface EnviarQRReservaParams {
    correoDestino: string;
    nombre: string;
    codigo_reserva: string;
    qrCode: string;
    estado: string;
}

export async function enviarCorreoCancelacion({ correoDestino, nombre, reservaId, codigo_reserva }: EnviarCorreoCancelacionParams) {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        // HTML del correo
        const htmlMensaje = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Cancelación de Reserva</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8; color:#333;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background-color:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                <tr>
                    <td style="background-color:#0e1d30; padding:20px; text-align:center; color:#ffffff;">
                        <img src="https://i.imgur.com/9Tp4bis.jpeg" alt="AirFlow Logo" width="240" style="display:block; margin:auto;" />
                    </td>
                </tr>
                <tr>
                    <td style="padding:30px;">
                        <p style="font-size:16px;">Hola <strong>${nombre}</strong>,</p>
                        <p style="font-size:16px;">Lamentamos informarte que tu reserva con código <strong>${codigo_reserva}</strong> ha sido cancelada.</p>
                        <p style="font-size:16px; line-height:1.5;">Esto puede deberse a la cancelación del vuelo asociado.</p>
                        <p style="font-size:14px; color:#777;">Para más información, contáctanos en soporte@airflowsystem.com.</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#888;">
                        © ${new Date().getFullYear()} AirFlow System - Todos los derechos reservados
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        const info = await transport.sendMail({
            from: `"AirFlow System" <${process.env.EMAIL_USER}>`,
            to: correoDestino,
            subject: "Cancelación de tu Reserva",
            html: htmlMensaje
        });

        console.log("Correo de cancelación enviado:", info.messageId);
        return true;

    } catch (error) {
        console.error("Error al enviar correo de cancelación:", error);
        return false;
    }
}

export async function enviarCorreoVerificacion({ correoDestino, nombre, token, usuario }: EnviarCorreoParams) {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Link de verificación (frontend donde el usuario pondrá su contraseña)
        const linkVerificacion = `${process.env.FRONTEND_URL}/verify-account?token=${token}`;

        // HTML del correo
        const htmlMensaje = `
        <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Verificación de cuenta</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background-color:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      <!-- Header -->
      <tr>
        <td style="background-color:#0e1d30; padding:20px; text-align:center; color:#ffffff;">
          <img src="https://i.imgur.com/9Tp4bis.jpeg" alt="AirFlow Logo" width="240" style="display:block; margin:auto;" />
        </td>
      </tr>
      <!-- Cuerpo -->
      <tr>
        <td style="padding:30px;">
          <p style="font-size:16px;">Hola <strong>${nombre}</strong>,</p>
          <p style="font-size:16px;">Tu nombre de usuario es: <strong>${usuario}</strong></p>
          <p style="font-size:16px; line-height:1.5;">
            Gracias por registrarte. Para activar tu cuenta, por favor haz clic en el siguiente botón:
          </p>
          <div style="text-align:center; margin:30px 0;">
            <a href="${linkVerificacion}" 
              style="background-color:#0e1d30; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-size:16px; display:inline-block;">
              Verificar mi cuenta
            </a>
          </div>
          <p style="font-size:14px; color:#555;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="word-break:break-all; font-size:14px; color:#0e1d30;">
            <a href="${linkVerificacion}" style="color:#0e1d30;">${linkVerificacion}</a>
          </p>
          <p style="font-size:14px; color:#777;">
            Este enlace expira en <strong>24 horas</strong>.
          </p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#888;">
          © ${new Date().getFullYear()} AirFlow System - Todos los derechos reservados
        </td>
      </tr>
    </table>
  </body>
  </html>
        `;

        // Enviar correo
        const info = await transport.sendMail({
            from: `"AirFlow System" <${process.env.EMAIL_USER}>`,
            to: correoDestino,
            subject: "Verifica tu cuenta",
            html: htmlMensaje
        });

        console.log("Correo enviado:", info.messageId);
        return true;

    } catch (error) {
        console.error("Error al enviar correo de verificación:", error);
        return false;
    }
}

export async function enviarCorreoRecuperacion({ correoDestino, nombre, token }: Omit<EnviarCorreoParams, 'usuario'>) {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Link de recuperación (frontend donde el usuario pondrá su nueva contraseña)
        const linkRecuperacion = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        // HTML del correo
        const htmlMensaje = `
        <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Recuperación de contraseña</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8; color:#333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background-color:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      <!-- Header -->
      <tr>
        <td style="background-color:#0e1d30; padding:20px; text-align:center; color:#ffffff;">
          <img src="https://i.imgur.com/9Tp4bis.jpeg" alt="AirFlow Logo" width="240" style="display:block; margin:auto;" />
        </td>
      </tr>
      <!-- Cuerpo -->
      <tr>
        <td style="padding:30px;">
          <p style="font-size:16px;">Hola <strong>${nombre}</strong>,</p>
          <p style="font-size:16px;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p style="font-size:16px; line-height:1.5;">
            Para restablecer tu contraseña, haz clic en el siguiente botón:
          </p>
          <div style="text-align:center; margin:30px 0;">
            <a href="${linkRecuperacion}" 
              style="background-color:#0e1d30; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-size:16px; display:inline-block;">
              Restablecer mi contraseña
            </a>
          </div>
          <p style="font-size:14px; color:#555;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="word-break:break-all; font-size:14px; color:#0e1d30;">
            <a href="${linkRecuperacion}" style="color:#0e1d30;">${linkRecuperacion}</a>
          </p>
          <p style="font-size:14px; color:#777;">
            Este enlace expira en <strong>24 horas</strong>.
          </p>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#888;">
          © ${new Date().getFullYear()} AirFlow System - Todos los derechos reservados
        </td>
      </tr>
    </table>
  </body>
  </html>
        `;

        // Enviar correo
        const info = await transport.sendMail({
            from: `"AirFlow System" <${process.env.EMAIL_USER}>`,
            to: correoDestino,
            subject: "Recuperación de contraseña",
            html: htmlMensaje
        });

        console.log("Correo enviado:", info.messageId);
        return true;

    } catch (error) {
        console.error("Error al enviar correo de recuperación:", error);
        return false;
    }
}

export async function enviarQRReserva({ correoDestino, nombre, codigo_reserva, qrCode, estado }: EnviarQRReservaParams) {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const qrBase64Data = qrCode.replace(/^data:image\/png;base64,/, "");

        // Hacer HTML guiandote del diseño anterior
        const htmlMensaje = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Tu código QR de reserva</title>
    </head>
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8; color:#333;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background-color:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#0e1d30; padding:20px; text-align:center; color:#ffffff;">
            <img src="https://i.imgur.com/9Tp4bis.jpeg" alt="AirFlow Logo" width="240" style="display:block; margin:auto;" />
          </td>
        </tr>
        
        <!-- Cuerpo -->
        <tr>
          <td style="padding:30px; text-align:center;">
            <h2 style="margin:0; color:#0e1d30;">¡Gracias por tu reserva, ${nombre}!</h2>
            <p style="font-size:16px; margin:20px 0; line-height:1.5;">
              Hemos generado tu boleto. Presenta este código QR al momento de tu <strong>check-in</strong>.
            </p>
            
            <div style="margin:25px 0;">
              <img src="cid:qrCodeImage" alt="Código QR de reserva" style="width:200px; height:200px;" />
            </div>

            <p style="font-size:16px; margin:10px 0;">
              Código de Reserva: <strong>${codigo_reserva}</strong>
            </p>
            
            <p style="font-size:14px; color:#555; margin-top:30px;">
              Estado de la reserva: <strong>${estado}</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#888;">
            © ${new Date().getFullYear()} AirFlow System - Todos los derechos reservados
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

        // Enviar correo
        const info = await transport.sendMail({
            from: `"AirFlow System" <${process.env.EMAIL_USER}>`,
            to: correoDestino,
            subject: "Tu código QR de reserva",
            html: htmlMensaje,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrBase64Data,
                    encoding: 'base64',
                    cid: 'qrCodeImage'
                }
            ]
        });

        console.log("Correo enviado:", info.messageId);
        return true;

    } catch (error) {
        console.error("Error al enviar correo con QR de reserva:", error);
        return false;
    }
}

export async function enviarCorreoActualizacionReserva({ correoDestino, nombre, codigo_reserva, qrCode, estado }: EnviarQRReservaParams) {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const qrBase64Data = qrCode.replace(/^data:image\/png;base64,/, "");

        // Hacer HTML guiandote del diseño anterior
        const htmlMensaje = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Actualizacion de tu reserva</title>
    </head>
    <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8; color:#333;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background-color:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#0e1d30; padding:20px; text-align:center; color:#ffffff;">
            <img src="https://i.imgur.com/9Tp4bis.jpeg" alt="AirFlow Logo" width="240" style="display:block; margin:auto;" />
          </td>
        </tr>
        
        <!-- Cuerpo -->
        <tr>
          <td style="padding:30px; text-align:center;">
            <h2 style="margin:0; color:#0e1d30;">¡Se ha actualizado el estado de tu reserva, ${nombre}!</h2>
            <p style="font-size:16px; margin:20px 0; line-height:1.5;">
              Aquí está el código QR actualizado de tu reserva.
            </p>
            
            <div style="margin:25px 0;">
              <img src="cid:qrCodeImage" alt="Código QR de reserva" style="width:200px; height:200px;" />
            </div>

            <p style="font-size:16px; margin:10px 0;">
              Código de Reserva: <strong>${codigo_reserva}</strong>
            </p>
            
            <p style="font-size:14px; color:#555; margin-top:30px;">
              Estado de la reserva: <strong>${estado}</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f0f0f0; text-align:center; padding:15px; font-size:12px; color:#888;">
            © ${new Date().getFullYear()} AirFlow System - Todos los derechos reservados
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

        // Enviar correo
        const info = await transport.sendMail({
            from: `"AirFlow System" <${process.env.EMAIL_USER}>`,
            to: correoDestino,
            subject: "Actualización de tu reserva",
            html: htmlMensaje,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrBase64Data,
                    encoding: 'base64',
                    cid: 'qrCodeImage'
                }
            ]
        });

        console.log("Correo enviado:", info.messageId);
        return true;

    } catch (error) {
        console.error("Error al enviar correo con QR de reserva:", error);
        return false;
    }
}