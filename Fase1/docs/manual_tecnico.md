# Manual Técnico de Airflow System

A continuación, se presenta el manual técnico y las estrategias que se usarán para llevar a cabo la aplicación AirFlow System.

# Patrones de Diseño a Usar:

Para la aplicación AirFlow System se tendrá contemplado usar 5 patrones de diseño dependiendo de la necesidad de la aplicación. Los patrones de diseño a usar serán:

- Patrón Singleton
- Patrón Repository
- Patrón Factory
- Patrón Observer
- Patrón Facade

A continuación se explicará la forma de usar cada patrón y uso en la aplicación.

## Patrón Singleton:

El patrón Singleton es conocido por ser un patrón de diseño usado para solamente crear una instancia de un solo atributo, proporcionando  un punto de acceso global a esta misma.

### Justificación:

La selección del Patrón Singleton es debido al uso de una conexión de base de datos en vez de múltiples conexiones. Esto hace que el sistema solamente tenga una conexión compartida, esto hace que se optimicen recursos y se eviten conflictos posteriores.

### En la Aplicación:

Se tiene contemplado que en la Aplicación AirFlow System, se cree una clase especializada para poder conectar la base de datos, y solamente conectar la base de datos con una instancia global. 

### Ejemplo de Aplicación:

```jsx
const mongoose = require('mongoose');
class Database {
  constructor() {
    if (Database.instance) return Database.instance;
    this.connect();
    Database.instance = this;
  }
  async connect() {
    await mongoose.connect('mongodb://localhost/airflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB');
  }
  static getInstance() {
    return Database.instance || new Database();
  }
}
Database.instance = null;
module.exports = Database.getInstance();
```

## Patrón Repository:

El Patrón Repository es un patrón de diseño que actúa como una capa intermedia entre la lógica de negocio y la capa de datos, en este caso que es mongoDB. Este patrón encapsula las operaciones de acceso de datos en una interfaz parecida a una colección. Hace que la aplicación sea modular y fácil en pruebas.

### Justificación:

Debido a que la aplicación Airflow maneja múltiples capas de operaciones, y operaciones complejas, el patrón repository centralizará la lógica del propio acceso de datos. Esto hará que la facilidad de cambiar a otra base de datos diferente de mongoDB sea más fácil. Esto hace que la arquitectura sea robusta y escalable. La combinación con el patrón Singleton es clave debido a que, si se desea en algún momento escalar la aplicación a otra base de datos, será mucho más fácil.

### En la aplicación:

Se tiene planeado usar en la aplicación como el intermedio entre las consultas y la implementación de la base de datos. Se crearán clases.repository para poder separar cada entidad de su lógica.

### Ejemplo de Aplicación:

```jsx
class FlightRepository {
  async getFlightById(id) {
    return await FlightModel.findById(id);
  }
  async createFlight(flightData) {
    return await FlightModel.create(flightData);
  }
  async updateFlightStatus(id, status) {
    return await FlightModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
module.exports = new FlightRepository();
```

## Patrón Factory:

El patrón Factory es conocido por tener una interfaz para crear objetos en base a ella. Esto permite que las subclases o configuraciones decidan que clase instanciar. Con el patrón Factory, se pueden crear objetos con interfaces similares pero implementaciones diferentes.

### Justificación:

En la aplicación AirFlow System se tienen diferentes roles en la tripulación, esto hace que no todos los integrantes tengan los mismos roles. El patrón Factory hará que se tengan centralizadas ciertas funciones globales para los miembros de la tripulación y, en base a eso, se podrán crear diferentes funciones que se desprenderán de la clase Padre.

### En la aplicación:

Se creará una classe Crew, la cual será el modelo para los distintos tipos de tripulación.

### Ejemplo de Aplicación:

```jsx
class Crew {
  static createCrew(type, data) {
    switch (type) {
      case 'pilot':
        return new Pilot(data.name, data.birthDate, data.flightHours);
      case 'copilot':
        return new Copilot(data.name, data.birthDate, data.flightHours);
      case 'flightAttendant':
        return new FlightAttendant(data.name, data.flightCount);
      default:
        throw new Error('Tipo de tripulante inválido');
    }
  }
}
module.exports = CrewFactory;
```

## Patrón Observer:

El patrón Observer es un patrón que establece una relación de uno a muchos entre objetos, de modo que cuando un objeto cambia de estado, todos sus dependientes son modificados y actualizados automáticamente.

### Justificación:

La aplicación requiere notificar a los pasajeros sobre cambios en el estado de los vuelos, y a la tripulación sobre asignaciones. El patrón Observer es ideal para gestionar las notificaciones en tiempo real, así se mejorará la experiencia del pasajero y reduce la carga del personal.

### En la Aplicación:

Se creará un EventEmitter en Nodejs, se usará para notificar a los pasajeros sobre cambios en el estado del vuelo o a la tripulación sobre asignaciones mediante correos electrónicos u otros canales. Esto hará que no desacople la lógica de notificaciones del negocio, volviéndola escalable y mejorando la experiencia de usuario:

### Ejemplo de Aplicación:

```jsx
const EventEmitter = require('events');
class Flight extends EventEmitter {
  constructor(id, status) {
    super();
    this.id = id;
    this.status = status;
  }
  updateStatus(newStatus) {
    this.status = newStatus;
    this.emit('statusChange', { flightId: this.id, status: newStatus });
  }
}
const flight = new Flight('FL123', 'Planificado');
flight.on('statusChange', ({ flightId, status }) => {
  // Enviar notificación por correo (por ejemplo, usando Nodemailer)
  console.log(`El vuelo ${flightId} cambió a estado ${status}`);
});
flight.updateStatus('Cancelado');
```

## Patrón Facade:

El patrón Facade proporciona una interfaz simplificada para un subsistema complejo, oculta sus detalles internos y facilita su uso.

### Justificación:

El sistema tiene múltiples subsistemas. El patrón Facade simplifica las interacciones entre el Frontend y el Backend. Ofrece una API unificada para operaciones complejas mejorando la usabilidad y el mantenimiento.

### En la Aplicación:

En el Frontend, React llamará a un endpoint el cual coordina la validación de los demás procesos. Se llevará a la reservación de asientos, esto hará que coordine la creación, gestión de reservas, entre otros. Esto simplifica el código del Frontend, mejora la mantenibilidad y mantiene las interfaces intuitivas y claras.

### Ejemplo de Aplicación:

```jsx
class BookingFacade {
  constructor(flightService, passengerService, notificationService) {
    this.flightService = flightService;
    this.passengerService = passengerService;
    this.notificationService = notificationService;
  }
  async bookFlight(passengerId, flightId, seat) {
    const isSeatAvailable = await this.flightService.checkSeatAvailability(flightId, seat);
    if (!isSeatAvailable) throw new Error('Asiento no disponible');
    const reservation = await this.flightService.createReservation(flightId, passengerId, seat);
    await this.passengerService.updatePassengerProfile(passengerId, { lastReservation: reservation.id });
    await this.notificationService.sendConfirmationEmail(passengerId, reservation);
    return reservation;
  }
}
module.exports = BookingFacade;
```

Como logramos ver, los cinco patrones, en base al análisis de la aplicación, son los mejores para poder trabajar. Los cinco patrones son compatibles, ya que trabajan en distintas capas del diseño de la aplicación y el modelo de negocio. Ambos se pueden trabajar sin necesidad de desacoplar o crear conflictos con los demás patrones de diseño elegidos.

# Diagrama de Bloques:
![diagrama_bloques](pictures/diagramaBloques.png)

# Diagrama de Despliegue:
![diagrama_despliegue](pictures/diagramaDespliegue.png)

# Diagrama de Componentes:
![diagrama_componentes](pictures/diagramaComponentes.png)

# Diagrama de Distribución:
![diagrama_distribucion](pictures/diagramaDistribucion.png)

# Diagrama de Clases:
![diagrama_clases](pictures/diagrama_clases.png)

# Diagrama de Esquemas

![diagrama_esquemas](pictures/diagrama_esquemas.png)

El modelo de datos presentado está diseñado para una base de datos NoSQL basada en MongoDB, utilizando un enfoque orientado a documentos y relaciones a través de referencias. A continuación, se detalla la estructura y las relaciones entre las colecciones:

1. **Colecciones Principales**:
    - **ColeccionAeronaves**: Almacena información sobre las aeronaves, incluyendo un identificador único (id_ObjectId), capacidad (capacidad), horas acumuladas (horas_acumuladas), estado (estado_vuelo), y un límite de horas (limite_horas). Esta colección sirve como fuente de datos para asignar aeronaves a vuelos.
    - **ColeccionVuelos**: Contiene detalles de los vuelos, como identificador único (id_ObjectId), origen, destino, fechas de salida y llegada (fecha_salida, fecha_llegada), estado (estado_vuelo), piloto (piloto_id), y sobrecargos (sobrecargos). Incluye referencias a ColeccionAeronaves y ColeccionEstados mediante sus respectivos id_ObjectId.
    - **ColeccionEstados**: Registra los estados posibles de los vuelos u otros elementos, con campos como id_ObjectId, estado, y tipo. Se utiliza como referencia para mantener consistencia en los estados a través de las colecciones.
    - **ColeccionUsuarios**: Almacena datos de los usuarios, incluyendo id_ObjectId, nombre completo, correo, teléfono, dirección, género, fecha de nacimiento, usuario, contraseña, tipo, y un array de vuelos completados (vuelos_completados). Incluye referencias a ColeccionVuelos.
    - **ColeccionReservasBoletos**: Gestiona las reservas y boletos, con campos como id_ObjectId, pasajero (pasajero_id), vuelo (vuelo_id), código, estado, maleta, peso, y tipo. Contiene referencias a ColeccionUsuarios y ColeccionVuelos.
2. **Relaciones y Referencias**:
    - Las relaciones entre colecciones se establecen mediante referencias usando el campo ObjectId de los documentos. Por ejemplo, ColeccionVuelos referencia a ColeccionAeronaves y ColeccionEstados para asociar una aeronave y su estado a un vuelo específico.
    - ColeccionUsuarios y ColeccionReservasBoletos mantienen referencias bidireccionales: los usuarios pueden tener múltiples reservas, mientras que cada reserva está vinculada a un usuario y un vuelo.
    - Esta estructura permite una flexibilidad típica de MongoDB, evitando la necesidad de un esquema relacional rígido, y facilita la denormalización cuando sea necesario.

# Matrices de trazabilidad

## Identificación de Stakeholders

| **Stakeholder** | **Descripción** |
| --- | --- |
| **SkyLink Technologies** | Empresa solicitante del sistema; interesada en mejorar la experiencia del pasajero y la eficiencia operativa. |
| **Aerolíneas** | Empresas que operan vuelos y utilizan la plataforma para gestionar tripulación, flota, reservas y check-in. |
| **Pasajeros** | Usuarios finales que registran perfiles, reservan vuelos, hacen check-in, abordan y reciben notificaciones del sistema. |
| **Pilotos y Copilotos** | Personal autorizado para iniciar/finalizar vuelos y registrar horas de vuelo acumuladas. |
| **Sobrecargos** | Tripulación encargada de la seguridad y atención a bordo; su asignación depende del número de pasajeros. |
| **Personal de Operaciones** | Encargados de planificar vuelos, asignar tripulación y gestionar la disponibilidad de aeronaves. |
| **Equipo de Mantenimiento** | Técnicos responsables de las revisiones y certificación de aeronaves tras alcanzar límites de horas de vuelo. |
| **Agentes de Seguridad/Aeropuerto** | Personal que asiste en check-in presencial y control en la puerta de embarque. |
| **Departamento de TI / Desarrolladores** | Encargados de diseñar, implementar y mantener el sistema AirFlow. |
| **Autoridades Aeronáuticas** | Entidades regulatorias que exigen el cumplimiento de normas de seguridad y operación aérea. |
| **Administradores del Programa de Fidelización** | Responsables de gestionar puntos, beneficios y notificaciones a pasajeros frecuentes. |

## Stakeholders vrs Requerimientos

### Stakeholders vrs Requerimientos funcionales

|  | RF1 | RF2 | RF3 | RF4 | RF5 | RF6 |
| --- | --- | --- | --- | --- | --- | --- |
| **SkyLink Technologies** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Aerolíneas** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Pasajeros** | **X** | - | - | **X** | **X** | **X** |
| **Pilotos y Copilotos** | **X** | **X** | - | - | - | - |
| **Sobrecargos** | - | **X** | - | - | - | - |
| **Personal de Operaciones** | **X** | **X** | **X** | - | - | - |
| **Equipo de Mantenimiento** | - | - | **X** | - | - | - |
| **Agentes de Seguridad/Aeropuerto** | - | - | - | - | **X** | - |
| **Departamento de TI / Desarrolladores** | - | - | - | - | **X** | - |
| **Autoridades Aeronáuticas** | **X** | **X** | **X** | **X** | **X** | - |
| **Administradores del Programa de Fidelización** | - | - | - | - | - | **X** |

### Stakeholders vrs Requerimientos No funcionales

|  | RNF - Rendimiento y Escalabilidad | RNF -Seguridad y Roles | RNF - Usabilidad y Accesibilidad | RNF - Disponibilidad y Recuperación | RNF - Arquitectura y Metodología | RNF - Integración Externa |
| --- | --- | --- | --- | --- | --- | --- |
| **SkyLink Technologies** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Aerolíneas** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Pasajeros** | **X** | **X** | **X** | **X** |  | **X** |
| **Pilotos y Copilotos** | **X** | **X** | **X** | **X** | - | - |
| **Sobrecargos** | **X** | **X** | - | - | - | - |
| **Personal de Operaciones** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Equipo de Mantenimiento** | **X** | **X** | - | **X** | - | - |
| **Agentes de Seguridad/Aeropuerto** | - | **X** | **X** | **X** | - | - |
| **Departamento de TI / Desarrolladores** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Autoridades Aeronáuticas** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Administradores del Programa de Fidelización** | **X** | **X** | **X** | **X** | - | **X** |

## Stakeholders vrs CDU

|  | CDU001 | CDU002 | CDU003 | CDU004 | CDU005 | CDU006 |
| --- | --- | --- | --- | --- | --- | --- |
| **SkyLink Technologies** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Aerolíneas** | **X** | **X** | **X** | **X** | **X** | **X** |
| **Pasajeros** | **X** | - | - | **X** | **X** | **X** |
| **Pilotos y Copilotos** | **X** | **X** | - | - | - | - |
| **Sobrecargos** | - | **X** | - | - | - | - |
| **Personal de Operaciones** | **X** | **X** | **X** | - | - | - |
| **Equipo de Mantenimiento** | - | - | **X** | - | - | - |
| **Agentes de Seguridad/Aeropuerto** | - | - | - | - | **X** | - |
| **Departamento de TI / Desarrolladores** | - | - | - | - | - | - |
| **Autoridades Aeronáuticas** | **X** | **X** | **X** | **X** | **X** | - |
| **Administradores del Programa de Fidelización** | - | - | - | - | - | **X** |

## Requerimientos vrs CDU

### Requerimientos Funcionales vrs CDU

|  | **CDU001** | **CDU002**  | **CDU003** | **CDU004**  | **CDU005** | **CDU006** |
| --- | --- | --- | --- | --- | --- | --- |
| **RF – Definir vuelo (origen, destino, fechas, tripulación, aeronave)** | X | X | X | - | - | - |
| **RF – Cancelar vuelo (anular reservas y notificar)** | X | - | - | X | - | - |
| **RF – Cambiar estados de vuelo**  | X | - | - | - | X | - |
| **RF – Pilotos marcan inicio y fin del vuelo** | X | X | X | - | - | - |
| **RF – Registro de tripulación (pilotos y sobrecargos)** | - | X | - | - | - | - |
| **RF – Asignación de tripulación a vuelo** | X | X | - | - | - | - |
| **RF – Actualizar experiencia post-vuelo** | - | X | - | - | - | - |
| **RF – Registro de aeronaves** | - | - | X | - | - | - |
| **RF – Acumular horas de vuelo aeronave** | X | - | X | - | - | - |
| **RF – Verificar límites y bloquear aeronave** | - | - | X | - | - | - |
| **RF – Certificación de mantenimiento** | - | - | X | - | - | - |
| **RF – Registro de pasajeros y perfiles** | - | - | - | X | - | - |
| **RF – Modificación de perfiles** | - | - | - | X | - | - |
| **RF – Reservar vuelo y asiento (boleto QR, 2 maletas)** | - | - | - | X | - | - |
| **RF – Check-in online o en aeropuerto** | - | - | - | - | X | - |
| **RF – Embarque (escaneo QR)** | - | - | - | - | X | - |
| **RF – Notificaciones a pasajeros** | X | - | - | X | X | X |
| **RF – Maletas extra (hasta 3)** | - | - | - | - | X | X |
| **RF – Programa de fidelización (puntos por vuelo, historial)** | - | - | - | - | - | X |

### Requerimientos No Funcionales vrs CDU

| **Requerimiento No Funcional** | **CDU001** | **CDU002** | **CDU003** | **CDU004** | **CDU005** | **CDU006** |
| --- | --- | --- | --- | --- | --- | --- |
| **RNF – Procesamiento rápido** | X | X | X | X | X | X |
| **RNF – Seguridad** | X | X | X | X | X | X |
| **RNF – Escalabilidad** | X | X | X | X | X | X |
| **RNF – Usabilidad y accesibilidad**  | X | X | X | X | X | X |
| **RNF – Disponibilidad 99.9% y recuperación de fallos** | X | X | X | X | X | X |
| **RNF – Arquitectura modular y patrones de diseño** | X | X | X | X | X | X |
| **RNF – Integración con externos**  | X | - | - | X | X | X |