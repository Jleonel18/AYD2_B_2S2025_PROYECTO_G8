import nodemailer from 'nodemailer'

interface EnviarCorreoParams {
    correoDestino: string;
    nombre: string;
    token: string;
    usuario: string
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