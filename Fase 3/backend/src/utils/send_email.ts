import nodemailer from 'nodemailer'
import { EstadoReserva } from '../types/reservas';
import { IUser } from '../core/repository/models/User';
import { IAvionRepository } from '../core/repository/repositories/IAvionRepository';
import { IUserRepository } from '../core/repository/repositories/IUserRepository';


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

interface EnviarCorreoReservaParams {
    correoDestino: string;
    nombre: string;
    codigo_reserva: string;
    qrCode: string;
    estado: EstadoReserva
}

interface EnviarCorreoMantenimientoParams {
    airplaneId: string;
    hours: number;
}

export async function notificarMantenimientoAAllOperaciones(params: EnviarCorreoMantenimientoParams, userRepository: IUserRepository, avionRepository: IAvionRepository): Promise<boolean> {
    try {
        const { airplaneId, hours } = params;

        // 2. Obtener todos los usuarios de tipo "operaciones"
        const usuariosOperaciones: IUser[] = await userRepository.findOperaciones();

        if (usuariosOperaciones.length === 0) {
            console.log('No se encontraron usuarios de tipo "operaciones".');
            return false;
        }

        // 3. Configurar transporte Nodemailer
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 4. Plantilla HTML del correo (similar a tus otros correos)
        const htmlMensaje = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Alerta de Mantenimiento de Avión</title>
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
                        <h2 style="margin:0; color:#0e1d30;">Alerta de Mantenimiento</h2>
                        <p style="font-size:16px;">Estimado equipo de operaciones,</p>
                        <p style="font-size:16px; line-height:1.5;">
                            Se requiere mantenimiento para el avión con ID <strong>${airplaneId}</strong>. 
                            Este avión ha alcanzado <strong>${hours}</strong> horas de vuelo, superando el límite establecido.
                        </p>
                        <p style="font-size:16px; line-height:1.5;">
                            Por favor, programa el mantenimiento lo antes posible y actualiza el estado del avión en el sistema.
                        </p>
                        <p style="font-size:14px; color:#777;">Para más detalles, contáctanos en soporte@airflowsystem.com.</p>
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

        // 5. Enviar correo a cada usuario de operaciones
        let correosEnviados = 0;
        for (const usuario of usuariosOperaciones) {
            const info = await transport.sendMail({
                from: `"AirFlow System" <${process.env.EMAIL_USER}>`,
                to: usuario.correo, // Asume que el modelo IUser tiene 'correo'
                subject: "Alerta de Mantenimiento de Avión",
                html: htmlMensaje
            });

            console.log(`Correo de mantenimiento enviado a ${usuario.correo}:`, info.messageId);
            correosEnviados++;
        }

        console.log(`Correos enviados a ${correosEnviados} usuarios de operaciones.`);
        return true;

    } catch (error) {
        console.error("Error al notificar mantenimiento a operaciones:", error);
        return false;
    }
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

export async function enviarCorreoReservaEstado({
  correoDestino,
  nombre,
  codigo_reserva,
  qrCode,
  estado,
}: EnviarCorreoReservaParams) {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const qrBase64Data = qrCode.replace(/^data:image\/png;base64,/, "");

    let titulo = "";
    let mensajePrincipal = "";

    switch (estado) {
      case "Pendiente de Check-in":
        titulo = `¡Gracias por tu reserva, ${nombre}!`;
        mensajePrincipal =
          "Hemos generado tu boleto. Presenta este código QR al momento de tu <strong>check-in</strong>.";
        break;

      case "Pendiente de Abordaje":
        titulo = `¡Tu vuelo está próximo, ${nombre}!`;
        mensajePrincipal =
          "Recuerda mostrar este código QR al momento de tu <strong>abordaje</strong>.";
        break;

      case "Abordado":
        titulo = `¡Buen viaje, ${nombre}!`;
        mensajePrincipal =
          "Esperamos que disfrutes tu experiencia. Guarda este correo por cualquier consulta relacionada con tu vuelo.";
        break;

      case "Aterrizado":
        titulo = `¡Esperamos que hayas disfrutado tu viaje, ${nombre}!`;
        mensajePrincipal =
          'Gracias por volar con AirFlow. Nos encantaría conocer tu opinión, por favor deja tu <a href="https://airflow.com/feedback" style="color:#0e1d30; font-weight:bold;">feedback aquí</a>.';
        break;
    }

    const htmlMensaje = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Estado de tu reserva</title>
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
            <h2 style="margin:0; color:#0e1d30;">${titulo}</h2>
            <p style="font-size:16px; margin:20px 0; line-height:1.5;">
              ${mensajePrincipal}
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

    const info = await transport.sendMail({
      from: `"AirFlow System" <${process.env.EMAIL_USER}>`,
      to: correoDestino,
      subject: `Actualización de tu reserva (${estado})`,
      html: htmlMensaje,
      attachments: [
        {
          filename: "qrcode.png",
          content: qrBase64Data,
          encoding: "base64",
          cid: "qrCodeImage",
        },
      ],
    });

    console.log("Correo enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar correo de reserva:", error);
    return false;
  }
}