import { VueloRepository } from '../core/repository/repositories/VueloRepository';
import { VueloModel } from '../core/repository/models/Vuelo';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('VueloRepository Tests', () => {
  let mongoServer: MongoMemoryServer;
  let vueloRepository: VueloRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    vueloRepository = new VueloRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await VueloModel.deleteMany({});
  });

  test('Debería crear un vuelo', async () => {
    const vueloData = {
      origen: 'Madrid',
      destino: 'Barcelona',
      fecha_salida: new Date(),
      fecha_llegada: new Date(),
      aeronave: new mongoose.Types.ObjectId().toString(),
      estado: new mongoose.Types.ObjectId().toString(),
      tripulacion: {
        piloto_id: new mongoose.Types.ObjectId().toString(),
        copiloto_id: new mongoose.Types.ObjectId().toString(),
        sobrecargos: [new mongoose.Types.ObjectId().toString()],
      },
    };

    const vuelo = await vueloRepository.create(vueloData);
    expect(vuelo).toBeDefined();
    expect(vuelo.origen).toBe('Madrid');
    expect(vuelo.destino).toBe('Barcelona');
  });

  test('Debería encontrar un vuelo por ID', async () => {
    const vueloData = {
      origen: 'Madrid',
      destino: 'Barcelona',
      fecha_salida: new Date(),
      fecha_llegada: new Date(),
      aeronave: new mongoose.Types.ObjectId().toString(),
      estado: new mongoose.Types.ObjectId().toString(),
      tripulacion: {
        piloto_id: new mongoose.Types.ObjectId().toString(),
        copiloto_id: new mongoose.Types.ObjectId().toString(),
        sobrecargos: [new mongoose.Types.ObjectId().toString()],
      },
    };

    const createdVuelo = await vueloRepository.create(vueloData);
    const foundVuelo = await vueloRepository.findById(createdVuelo._id);
    expect(foundVuelo).toBeDefined();
    expect(foundVuelo?.origen).toBe('Madrid');
  });

  test('Debería listar todos los vuelos', async () => {
    const vueloData = {
      origen: 'Madrid',
      destino: 'Barcelona',
      fecha_salida: new Date(),
      fecha_llegada: new Date(),
      aeronave: new mongoose.Types.ObjectId().toString(),
      estado: new mongoose.Types.ObjectId().toString(),
      tripulacion: {
        piloto_id: new mongoose.Types.ObjectId().toString(),
        copiloto_id: new mongoose.Types.ObjectId().toString(),
        sobrecargos: [new mongoose.Types.ObjectId().toString()],
      },
    };

    await vueloRepository.create(vueloData);
    const vuelos = await vueloRepository.findAll();
    expect(vuelos.length).toBeGreaterThan(0);
  });

  test('Debería actualizar un vuelo', async () => {
    const vueloData = {
      origen: 'Madrid',
      destino: 'Barcelona',
      fecha_salida: new Date(),
      fecha_llegada: new Date(),
      aeronave: new mongoose.Types.ObjectId().toString(),
      estado: new mongoose.Types.ObjectId().toString(),
      tripulacion: {
        piloto_id: new mongoose.Types.ObjectId().toString(),
        copiloto_id: new mongoose.Types.ObjectId().toString(),
        sobrecargos: [new mongoose.Types.ObjectId().toString()],
      },
    };

    const createdVuelo = await vueloRepository.create(vueloData);
    const updatedData = { destino: 'Valencia' };
    const updatedVuelo = await vueloRepository.update(createdVuelo._id, updatedData);
    expect(updatedVuelo?.destino).toBe('Valencia');
  });

  test('Debería eliminar un vuelo', async () => {
    const vueloData = {
      origen: 'Madrid',
      destino: 'Barcelona',
      fecha_salida: new Date(),
      fecha_llegada: new Date(),
      aeronave: new mongoose.Types.ObjectId().toString(),
      estado: new mongoose.Types.ObjectId().toString(),
      tripulacion: {
        piloto_id: new mongoose.Types.ObjectId().toString(),
        copiloto_id: new mongoose.Types.ObjectId().toString(),
        sobrecargos: [new mongoose.Types.ObjectId().toString()],
      },
    };

    const createdVuelo = await vueloRepository.create(vueloData);
    await vueloRepository.delete(createdVuelo._id);
    const foundVuelo = await vueloRepository.findById(createdVuelo._id);
    expect(foundVuelo).toBeNull();
  });
});