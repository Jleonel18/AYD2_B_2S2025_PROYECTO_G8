jest.mock('../utils/send_email', () => ({
  enviarCorreoVerificacion: jest.fn().mockResolvedValue(true),
}));
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';

// Cerrar conexiones después de todas las pruebas
afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/users - Registro de usuarios', () => {
  
  describe('Registro exitoso', () => {
    test('debe crear un usuario pasajero con datos válidos', async () => {
      const nuevoUsuario = {
        tipo: 'pasajero',
        datos: {
          nombre: 'Juan Pérez García',
          fecha_nacimiento: '1990-01-01',
          edad: 34,
          genero: 'Masculino',
          pasaporte: {
            numero: 'A12345678',
            pais_emision: 'Guatemala',
            fecha_vencimiento: '2030-12-31'
          },
          direccion: 'Calle Principal 123',
          correo: 'juan.test3@example.com',
          telefono: '12345678',
          dpi: '1234567890123'
        }
      };

      const response = await request(app)
        .post('/api/users')
        .send(nuevoUsuario)
        .set('Content-Type', 'application/json');

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
    }, 10000);
  });

  describe('Validaciones de datos', () => {
    test('debe rechazar registro sin nombre', async () => {
      const usuarioInvalido = {
        tipo: 'pasajero',
        datos: {
          fecha_nacimiento: '1990-01-01',
          edad: 34,
          genero: 'Masculino',
          pasaporte: {
            numero: 'A12345678',
            pais_emision: 'Guatemala',
            fecha_vencimiento: '2030-12-31'
          },
          direccion: 'Calle Principal 123',
          correo: 'test@example.com',
          telefono: '12345678',
          dpi: '1234567890123'
        }
      };

      const response = await request(app)
        .post('/api/users')
        .send(usuarioInvalido);

      expect(response.status).toBe(400);
    }, 10000);

    test('debe rechazar edad menor a 18 años', async () => {
      const usuarioMenor = {
        tipo: 'pasajero',
        datos: {
          nombre: 'Menor de Edad',
          fecha_nacimiento: '2010-01-01',
          edad: 14,
          genero: 'Masculino',
          pasaporte: {
            numero: 'C11111111',
            pais_emision: 'Guatemala',
            fecha_vencimiento: '2030-12-31'
          },
          direccion: 'Calle 123',
          correo: 'menor@example.com',
          telefono: '11111111',
          dpi: '1111111111111'
        }
      };

      const response = await request(app)
        .post('/api/users')
        .send(usuarioMenor);

      expect(response.status).toBe(400);
    }, 10000);

    test('debe rechazar correo inválido', async () => {
      const usuarioCorreoInvalido = {
        tipo: 'pasajero',
        datos: {
          nombre: 'Pedro Gómez',
          fecha_nacimiento: '1990-01-01',
          edad: 34,
          genero: 'Masculino',
          pasaporte: {
            numero: 'D22222222',
            pais_emision: 'Guatemala',
            fecha_vencimiento: '2030-12-31'
          },
          direccion: 'Calle 456',
          correo: 'correo-invalido',
          telefono: '22222222',
          dpi: '2222222222222'
        }
      };

      const response = await request(app)
        .post('/api/users')
        .send(usuarioCorreoInvalido);

      expect(response.status).toBe(400);
    }, 10000);

    test('debe rechazar teléfono con menos de 8 caracteres', async () => {
      const usuarioTelInvalido = {
        tipo: 'pasajero',
        datos: {
          nombre: 'Ana Silva',
          fecha_nacimiento: '1990-01-01',
          edad: 34,
          genero: 'Femenino',
          pasaporte: {
            numero: 'E33333333',
            pais_emision: 'Guatemala',
            fecha_vencimiento: '2030-12-31'
          },
          direccion: 'Calle 789',
          correo: 'ana@example.com',
          telefono: '1234567',
          dpi: '3333333333333'
        }
      };

      const response = await request(app)
        .post('/api/users')
        .send(usuarioTelInvalido);

      expect(response.status).toBe(400);
    }, 10000);

    test('debe rechazar DPI con menos de 13 caracteres', async () => {
      const usuarioDpiInvalido = {
        tipo: 'pasajero',
        datos: {
          nombre: 'Carlos Ruiz',
          fecha_nacimiento: '1990-01-01',
          edad: 34,
          genero: 'Masculino',
          pasaporte: {
            numero: 'F44444444',
            pais_emision: 'Guatemala',
            fecha_vencimiento: '2030-12-31'
          },
          direccion: 'Calle 101',
          correo: 'carlos@example.com',
          telefono: '44444444',
          dpi: '123456789012'
        }
      };

      const response = await request(app)
        .post('/api/users')
        .send(usuarioDpiInvalido);

      expect(response.status).toBe(400);
    }, 10000);

    test('debe rechazar pasaporte vencido', async () => {
      const usuarioPasaporteVencido = {
        tipo: 'pasajero',
        datos: {
          nombre: 'Laura Méndez',
          fecha_nacimiento: '1990-01-01',
          edad: 34,
          genero: 'Femenino',
          pasaporte: {
            numero: 'G55555555',
            pais_emision: 'Guatemala',
            fecha_vencimiento: '2020-12-31'
          },
          direccion: 'Calle 202',
          correo: 'laura@example.com',
          telefono: '55555555',
          dpi: '5555555555555'
        }
      };

      const response = await request(app)
        .post('/api/users')
        .send(usuarioPasaporteVencido);

      expect(response.status).toBe(400);
    }, 10000);
  });
});