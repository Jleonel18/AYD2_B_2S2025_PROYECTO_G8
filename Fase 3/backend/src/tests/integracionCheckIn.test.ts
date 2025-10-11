import request from 'supertest';
import express, { Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ReservaController } from '../modules/reservation/controller/reservationController';
import { ReservaRepository } from '../core/repository/repositories/ReservaRepository';
import { ReservaFacade } from '../core/facade/ReservaFacade';
import { UserService } from '../core/repository/services/UserService';
import { VueloService } from '../core/repository/services/VueloService';
import * as qrCodeUtils from '../utils/qr';
import * as correoUtils from '../utils/send_email';
import { EstadoReserva } from '../../src/types/reservas';
import { tokenAuth, authorizeRoles } from '../middleware/authMiddleware';

// Mock de dependencias
jest.mock('../core/repository/repositories/ReservaRepository');
jest.mock('../core/repository/services/UserService');
jest.mock('../core/repository/services/VueloService');
jest.mock('../core/facade/ReservaFacade');
jest.mock('../utils/qr');
jest.mock('../utils/send_email');
jest.mock('../core/repository/repositories/UserRepository');
jest.mock('../core/repository/repositories/VueloRepository');

// Configuración de la app de Express para pruebas
const app = express();
app.use(express.json());

// Simular el endpoint de login
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  correo: 'user@example.com',
  nombre: 'Juan Pérez',
  tipo: 'pasajero',
};

app.post('/api/users/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (!usuario || !contrasena) {
    return res.status(400).json({ message: 'Faltan datos' });
  }
  if (usuario === 'juan' && contrasena === '1234') {
    const token = jwt.sign(mockUser, 'secreto', { expiresIn: '1h' });
    return res.status(200).json({
      usuario: mockUser,
      token,
    });
  }
  return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
});

// Instanciar dependencias mockeadas
const reservaRepository = new ReservaRepository();
const userRepository = {} as any;
const vueloRepository = {} as any;
const userService = new UserService(userRepository);
const vueloService = new VueloService(vueloRepository);
const reservaFacade = new ReservaFacade(vueloService, {} as any, {} as any);
const reservaController = new ReservaController(reservaFacade, userService, vueloService);

// Configurar el endpoint de check-in con los middlewares reales
app.post('/api/reservas/checkin/:id', tokenAuth, authorizeRoles('pasajero'), reservaController.hacerCheckIn.bind(reservaController));

describe('POST /api/reservas/checkin/:id', () => {
  const mockReserva = {
    _id: new mongoose.Types.ObjectId(),
    id_usuario: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Coincide con mockUser._id
    id_vuelo: new mongoose.Types.ObjectId(),
    asientos_reservados: 2,
    asientos: [1, 2],
    fecha_reserva: new Date(),
    estado: EstadoReserva.pendiente_checkin,
    codigo_reserva: 'RSV-ABC123',
    maletas: [],
  };

  const mockMaletas = [
    { tipo: 'equipaje de mano', peso: 20 },
    { tipo: 'equipaje facturado', peso: 30 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('debería realizar el check-in exitosamente y devolver la reserva actualizada', async () => {
    // Mock de dependencias
    (reservaFacade.hacerCheckIn as jest.Mock).mockResolvedValue({
      ...mockReserva,
      estado: EstadoReserva.pendiente_abordaje,
      maletas: mockMaletas,
    });
    (qrCodeUtils.generarCodigoQR as jest.Mock).mockResolvedValue('mocked-qr-code');
    (correoUtils.enviarCorreoReservaEstado as jest.Mock).mockResolvedValue(true);

    // Simular login para obtener token
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'juan', contrasena: '1234' });

    const token = loginResponse.body.token;

    // Simular solicitud al endpoint de check-in
    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ maletas: mockMaletas });

    // Verificaciones
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Check-in realizado exitosamente',
      reserva: expect.objectContaining({
        _id: mockReserva._id.toString(),
        id_usuario: mockUser._id,
        id_vuelo: mockReserva.id_vuelo.toString(),
        estado: EstadoReserva.pendiente_abordaje,
        codigo_reserva: 'RSV-ABC123',
        maletas: mockMaletas,
      }),
    });
    expect(reservaFacade.hacerCheckIn).toHaveBeenCalledWith(mockReserva._id.toString(), undefined, mockMaletas);
    expect(qrCodeUtils.generarCodigoQR).toHaveBeenCalledWith(mockReserva._id.toString());
    expect(correoUtils.enviarCorreoReservaEstado).toHaveBeenCalledWith({
      correoDestino: 'user@example.com',
      nombre: 'Juan Pérez',
      codigo_reserva: 'RSV-ABC123',
      qrCode: 'mocked-qr-code',
      estado: EstadoReserva.pendiente_abordaje,
    });
  });

  it('debería devolver 404 si la reserva no se encuentra', async () => {
    (reservaFacade.hacerCheckIn as jest.Mock).mockResolvedValue(null);

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'juan', contrasena: '1234' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ maletas: mockMaletas });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Reserva no encontrada' });
    expect(reservaFacade.hacerCheckIn).toHaveBeenCalledWith(mockReserva._id.toString(), undefined, mockMaletas);
  });

  it('debería devolver 500 si la reserva no está en estado pendiente_checkin', async () => {
    (reservaFacade.hacerCheckIn as jest.Mock).mockRejectedValue(new Error('La reserva no está en estado de check-in'));

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'juan', contrasena: '1234' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ maletas: mockMaletas });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error al hacer check-in' });
    expect(reservaFacade.hacerCheckIn).toHaveBeenCalledWith(mockReserva._id.toString(), undefined, mockMaletas);
  });

  it('debería devolver 500 si el usuario no tiene permiso para la reserva', async () => {
    (reservaFacade.hacerCheckIn as jest.Mock).mockRejectedValue(new Error('No tienes permiso para hacer check-in en esta reserva'));

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'juan', contrasena: '1234' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ maletas: mockMaletas });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error al hacer check-in' });
    expect(reservaFacade.hacerCheckIn).toHaveBeenCalledWith(mockReserva._id.toString(), undefined, mockMaletas);
  });

  it('debería devolver 500 si una maleta excede el peso permitido', async () => {
    (reservaFacade.hacerCheckIn as jest.Mock).mockRejectedValue(new Error('La maleta excede el límite de peso permitido (50 lbs)'));

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'juan', contrasena: '1234' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ maletas: [{ tipo: 'equipaje de mano', peso: 60 }] });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error al hacer check-in' });
    expect(reservaFacade.hacerCheckIn).toHaveBeenCalledWith(mockReserva._id.toString(), undefined, [{ tipo: 'equipaje de mano', peso: 60 }]);
  });

  it('debería devolver 401 si no se proporciona un token', async () => {
    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .send({ maletas: mockMaletas });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token no proporcionado' });
    expect(reservaFacade.hacerCheckIn).not.toHaveBeenCalled();
  });

  it('debería devolver 403 si el token no es válido', async () => {
    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', 'Bearer invalid-token')
      .send({ maletas: mockMaletas });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Token no válido' });
    expect(reservaFacade.hacerCheckIn).not.toHaveBeenCalled();
  });

  it('debería devolver 403 si el usuario no tiene el rol de pasajero', async () => {
    const nonPassengerUser = {
      _id: '507f1f77bcf86cd799439011',
      correo: 'user@example.com',
      nombre: 'Juan Pérez',
      tipo: 'admin', // Rol no permitido
    };
    const token = jwt.sign(nonPassengerUser, 'secreto', { expiresIn: '1h' });

    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ maletas: mockMaletas });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'No tienes permisos para esta acción' });
    expect(reservaFacade.hacerCheckIn).not.toHaveBeenCalled();
  });

  it('debería devolver 200 si falla el envío del correo', async () => {
    (reservaFacade.hacerCheckIn as jest.Mock).mockResolvedValue({
      ...mockReserva,
      estado: EstadoReserva.pendiente_abordaje,
      maletas: mockMaletas,
    });
    (qrCodeUtils.generarCodigoQR as jest.Mock).mockResolvedValue('mocked-qr-code');
    (correoUtils.enviarCorreoReservaEstado as jest.Mock).mockResolvedValue(false);

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'juan', contrasena: '1234' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ maletas: mockMaletas });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Check-in realizado exitosamente',
      reserva: expect.objectContaining({
        _id: mockReserva._id.toString(),
        id_usuario: mockUser._id,
        id_vuelo: mockReserva.id_vuelo.toString(),
        estado: EstadoReserva.pendiente_abordaje,
        codigo_reserva: 'RSV-ABC123',
        maletas: mockMaletas,
      }),
    });
    expect(reservaFacade.hacerCheckIn).toHaveBeenCalledWith(mockReserva._id.toString(), undefined, mockMaletas);
    expect(qrCodeUtils.generarCodigoQR).toHaveBeenCalledWith(mockReserva._id.toString());
    expect(correoUtils.enviarCorreoReservaEstado).toHaveBeenCalled();
  });

  it('debería devolver 500 si ocurre un error en el servidor', async () => {
    (reservaFacade.hacerCheckIn as jest.Mock).mockRejectedValue(new Error('Error en la base de datos'));

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'juan', contrasena: '1234' });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/api/reservas/checkin/${mockReserva._id.toString()}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ maletas: mockMaletas });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error al hacer check-in' });
    expect(reservaFacade.hacerCheckIn).toHaveBeenCalledWith(mockReserva._id.toString(), undefined, mockMaletas);
  });
});