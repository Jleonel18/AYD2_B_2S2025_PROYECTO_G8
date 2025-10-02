describe('Agregar un Vuelo', () => {
  // Configuración común para todas las pruebas
  beforeEach(() => {
    // Limpia el almacenamiento para evitar efectos secundarios
    cy.clearLocalStorage();
    cy.clearCookies();

    // Simula la respuesta de la API de login
    cy.intercept('POST', '**/users/login', (req) => {
      console.log('Intercepted login request:', req);
      req.reply({
        statusCode: 200,
        body: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aXBvIjoib3BlcmFjaW9uZXMiLCJpZCI6IjY4YmE2ZDljYmM0NmM4MjZjYTViNDZmYyIsImlhdCI6MTcyNzgxNzYwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          usuario: {
            _id: '68ba6d9cbc46c826ca5b46fc',
            nombre: 'Carlos Lópezaaaaa',
            correo: 'lopezajvixjoseleonel@gmail.com',
            edad: 28,
            telefono: '+50255555555',
            direccion: 'Zona 15, Ciudad de Guatemala',
            genero: 'Masculino',
            fecha_nacimiento: '2002-09-10T00:00:00.000Z',
            dpi: '1029384756102',
            usuario: 'admin',
            tipo: 'operaciones',
            vuelos: [],
            activo: true,
          },
        },
      });
    }).as('loginMock');

    // Simula las solicitudes GET de VuelosPage
    cy.intercept('GET', '**/vuelos', {
      statusCode: 200,
      body: [
        {
          _id: 'flight123',
          numero_vuelo: 'FL1234',
          origen: 'airport1',
          destino: 'airport2',
          fecha_salida: '2025-10-02T10:00:00Z',
          fecha_llegada: '2025-10-02T12:00:00Z',
          aeronave: 'aircraft1',
          estado: 'Planificado',
          tripulacion: {
            piloto_id: 'pilot1',
            copiloto_id: 'pilot2',
            sobrecargos: ['crew1', 'crew2'],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }).as('getFlights');

    cy.intercept('GET', '**/aeropuertos/', {
      statusCode: 200,
      body: [
        { _id: 'airport1', nombre: 'Aeropuerto Guatemala' },
        { _id: 'airport2', nombre: 'Aeropuerto México' },
      ],
    }).as('getAirports');

    cy.intercept('GET', '**/users/trabajadores', {
      statusCode: 200,
      body: {
        trabajadores: [
          { _id: 'pilot1', nombre: 'Carlos Lópezaaaaa', tipo: 'piloto' },
          { _id: 'pilot2', nombre: 'Juan Pérez', tipo: 'piloto' },
          { _id: 'crew1', nombre: 'Ana Gómez', tipo: 'sobrecargo' },
          { _id: 'crew2', nombre: 'María López', tipo: 'sobrecargo' },
        ],
      },
    }).as('getWorkers');

    cy.intercept('GET', '**/aviones/', {
      statusCode: 200,
      body: [
        { _id: 'aircraft1', modelo: 'Boeing 737', capacidadMaxima: 100 },
      ],
    }).as('getAircrafts');

    // Realiza el login
    cy.visit('http://localhost:5173/');
    cy.get('.relative > .text-white').click();
    cy.get('#user').type('admin');
    cy.get('#password').type('1234ABcd');
    cy.get('[data-cy="login-button"]').click();
    cy.wait('@loginMock');
    cy.url().should('include', 'http://localhost:5173/dashboard-admin');
  });

  // Caso de prueba 1: Navega a la página de vuelos
  it('navega a la página de vuelos desde el dashboard', () => {
    cy.get('[data-cy="sidebar-vuelos"]').click();
    cy.url().should('include', 'http://localhost:5173/vuelos');
    cy.wait(['@getFlights', '@getAirports', '@getWorkers', '@getAircrafts']);
    cy.contains('Lista de Vuelos').should('be.visible');
  });

  // Caso de prueba 2: Agrega un nuevo vuelo
  it('agrega un nuevo vuelo correctamente', () => {
    // Navega a la página de vuelos
    cy.get('[data-cy="sidebar-vuelos"]').click();
    cy.url().should('include', 'http://localhost:5173/vuelos');
    cy.wait(['@getFlights', '@getAirports', '@getWorkers', '@getAircrafts']);

    // Simula la respuesta de la API para crear un vuelo
    cy.intercept('POST', '**/vuelos', (req) => {
      console.log('Intercepted vuelo request:', req);
      req.reply({
        statusCode: 201,
        body: {
          _id: 'flight123',
          numero_vuelo: 'FL1234',
          origen: 'airport1',
          destino: 'airport2',
          fecha_salida: '2025-10-02T10:00:00Z',
          fecha_llegada: '2025-10-02T12:00:00Z',
          aeronave: 'aircraft1',
          estado: 'Planificado',
          tripulacion: {
            piloto_id: 'pilot1',
            copiloto_id: 'pilot2',
            sobrecargos: ['crew1', 'crew2'],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }).as('createVuelo');

    //Espera 6 segundos
    cy.wait(6000);

    // Abre el formulario de nuevo vuelo
    cy.get('[data-cy="open-vuelo-button"]').click();
    cy.contains('Nuevo Vuelo').should('be.visible');

    // Llena el formulario
    cy.get('input[name="numero_vuelo"]').type('FL1234');
    cy.get('select[name="origen"]').select('Aeropuerto Guatemala');
    cy.get('select[name="destino"]').select('Aeropuerto México');
    cy.get('input[name="fecha_salida"]').type('2025-10-02T10:00');
    cy.get('input[name="fecha_llegada"]').type('2025-10-02T12:00');
    cy.get('select[name="aeronave"]').select('Boeing 737');
    cy.get('select[name="piloto_id"]').select('Carlos Lópezaaaaa');
    cy.get('select[name="copiloto_id"]').select('Juan Pérez');

    // Selecciona los sobrecargos (2 requeridos según capacidadMaxima: 100)
    cy.get('form > :nth-child(2) > :nth-child(2)').select('Ana Gómez'); // Primer sobrecargo
    cy.get('form > :nth-child(2) > :nth-child(3)').select('María López'); // Segundo sobrecargo

    // Envía el formulario
    cy.get('button.bg-blue-600').contains('Guardar').click();

    // Espera a que la solicitud de creación se complete
    cy.wait('@createVuelo');

    // Verifica que el vuelo aparece en la lista
    cy.contains('FL1234').should('be.visible');
    cy.contains('Aeropuerto Guatemala').should('be.visible');
    cy.contains('Aeropuerto México').should('be.visible');
    cy.contains('Planificado').should('be.visible');
  });

  // Caso de prueba 3: Cancela un vuelo existente
  it('cancela un vuelo existente correctamente', () => {
    // Navega a la página de vuelos
    cy.get('[data-cy="sidebar-vuelos"]').click();
    cy.url().should('include', 'http://localhost:5173/vuelos');
    cy.wait(['@getFlights', '@getAirports', '@getWorkers', '@getAircrafts']);

    // Simula la respuesta de la API para cancelar un vuelo
    cy.intercept('PATCH', '**/vuelos/flight123', (req) => {
      console.log('Intercepted cancel vuelo request:', req);
      req.reply({
        statusCode: 200,
        body: {
          _id: 'flight123',
          numero_vuelo: 'FL1234',
          origen: 'airport1',
          destino: 'airport2',
          fecha_salida: '2025-10-02T10:00:00Z',
          fecha_llegada: '2025-10-02T12:00:00Z',
          aeronave: 'aircraft1',
          estado: 'Cancelado',
          tripulacion: {
            piloto_id: 'pilot1',
            copiloto_id: 'pilot2',
            sobrecargos: ['crew1', 'crew2'],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }).as('cancelVuelo');

    // Verifica que el vuelo existe en la lista
    cy.contains('FL1234').should('be.visible');
    cy.contains('Planificado').should('be.visible');

    // Hace clic en el botón de cancelar (ícono ❌)
    cy.get('tr').contains('FL1234').parent().find('button.text-red-500').click();

    // Verifica que el modal de confirmación aparece
    cy.contains('Confirmar Cancelación').should('be.visible');
    cy.contains('¿Estás seguro de que deseas cancelar el vuelo FL1234?').should('be.visible');

    // Confirma la cancelación
    cy.get('button.bg-red-500').contains('Sí, cancelar vuelo').click();

    // Espera a que la solicitud de cancelación se complete
    cy.wait('@cancelVuelo');

    // Verifica el mensaje de éxito
    cy.contains('Vuelo cancelado exitosamente').should('be.visible');

    // Verifica que el estado del vuelo se actualiza a "Cancelado"
    cy.contains('FL1234').parent().contains('Cancelado').should('be.visible');
  });

  it('muestra error si faltan datos requeridos al crear un vuelo', () => {
    // Navega a la página de vuelos
    cy.get('[data-cy="sidebar-vuelos"]').click();
    cy.url().should('include', 'http://localhost:5173/vuelos');
    cy.wait(['@getFlights', '@getAirports', '@getWorkers', '@getAircrafts']);

    // Simula la respuesta de error de la API
    cy.intercept('POST', '**/vuelos', {
      statusCode: 400,
      body: { error: 'Faltan datos requeridos para crear el vuelo' },
    }).as('createVueloError');

    // Espera 6 segundos
    cy.wait(6000);

    // Abre el formulario
    cy.get('button.bg-blue-600').contains('+ Nuevo Vuelo').click();
    cy.contains('Nuevo Vuelo').should('be.visible');

    // Llena el formulario, omitiendo 'origen'
    cy.get('input[name="numero_vuelo"]').type('FL1234');
    // No selecciona 'origen' para provocar el error
    cy.get('select[name="destino"]').select('Aeropuerto México');
    cy.get('input[name="fecha_salida"]').type('2025-10-02T10:00');
    cy.get('input[name="fecha_llegada"]').type('2025-10-02T12:00');
    cy.get('select[name="aeronave"]').select('Boeing 737');
    cy.get('select[name="piloto_id"]').select('Carlos Lópezaaaaa');
    cy.get('select[name="copiloto_id"]').select('Juan Pérez');
    cy.get('form > :nth-child(2) > :nth-child(2)').select('Ana Gómez');
    cy.get('form > :nth-child(2) > :nth-child(3)').select('María López');

    // Envía el formulario
    cy.get('button.bg-blue-600').contains('Guardar').click();

    // Espera la respuesta de error
    cy.wait('@createVueloError');

    // Verifica el mensaje de error en el frontend
    cy.get('[data-cy="error-message"]').contains('Faltan datos requeridos para crear el vuelo').should('be.visible');
  });

  // Caso de prueba 5: Error por fechas inválidas
  it('muestra error si la fecha de salida no es anterior a la fecha de llegada', () => {
    // Navega a la página de vuelos
    cy.get('[data-cy="sidebar-vuelos"]').click();
    cy.url().should('include', 'http://localhost:5173/vuelos');
    cy.wait(['@getFlights', '@getAirports', '@getWorkers', '@getAircrafts']);

    // Simula la respuesta de error de la API
    cy.intercept('POST', '**/vuelos', {
      statusCode: 400,
      body: { error: 'Fechas inválidas o fecha_salida debe ser anterior a fecha_llegada' },
    }).as('createVueloError');

    //Espera 6 segundos
    cy.wait(6000);

    // Abre el formulario
    cy.get('button.bg-blue-600').contains('+ Nuevo Vuelo').click();
    cy.contains('Nuevo Vuelo').should('be.visible');

    // Llena el formulario con fecha_salida >= fecha_llegada
    cy.get('input[name="numero_vuelo"]').type('FL1234');
    cy.get('select[name="origen"]').select('Aeropuerto Guatemala');
    cy.get('select[name="destino"]').select('Aeropuerto México');
    cy.get('input[name="fecha_salida"]').type('2025-10-02T12:00'); // Igual a fecha_llegada
    cy.get('input[name="fecha_llegada"]').type('2025-10-02T12:00');
    cy.get('select[name="aeronave"]').select('Boeing 737');
    cy.get('select[name="piloto_id"]').select('Carlos Lópezaaaaa');
    cy.get('select[name="copiloto_id"]').select('Juan Pérez');
    cy.get('form > :nth-child(2) > :nth-child(2)').select('Ana Gómez');
    cy.get('form > :nth-child(2) > :nth-child(3)').select('María López');

    // Envía el formulario
    cy.get('button.bg-blue-600').contains('Guardar').click();

    // Espera la respuesta de error
    cy.wait('@createVueloError');

    // Verifica el mensaje de error en el frontend
    cy.get('[data-cy="error-message"]').contains('Fechas inválidas o fecha_salida debe ser anterior a fecha_llegada').should('be.visible');
  });


  // Caso de prueba 6: Error por piloto no disponible
  it('muestra error si el piloto no está disponible', () => {
    // Navega a la página de vuelos
    cy.get('[data-cy="sidebar-vuelos"]').click();
    cy.url().should('include', 'http://localhost:5173/vuelos');
    cy.wait(['@getFlights', '@getAirports', '@getWorkers', '@getAircrafts']);

    // Simula la respuesta de error de la API
    cy.intercept('POST', '**/vuelos', {
      statusCode: 400,
      body: { error: 'El piloto ya tiene un vuelo asignado en la misma fecha' },
    }).as('createVueloError');

    //Espera 6 segundos
    cy.wait(6000);

    // Abre el formulario
    cy.get('button.bg-blue-600').contains('+ Nuevo Vuelo').click();
    cy.contains('Nuevo Vuelo').should('be.visible');

    // Llena el formulario
    cy.get('input[name="numero_vuelo"]').type('FL1234');
    cy.get('select[name="origen"]').select('Aeropuerto Guatemala');
    cy.get('select[name="destino"]').select('Aeropuerto México');
    cy.get('input[name="fecha_salida"]').type('2025-10-02T10:00');
    cy.get('input[name="fecha_llegada"]').type('2025-10-02T12:00');
    cy.get('select[name="aeronave"]').select('Boeing 737');
    cy.get('select[name="piloto_id"]').select('Carlos Lópezaaaaa'); // Piloto no disponible
    cy.get('select[name="copiloto_id"]').select('Juan Pérez');
    cy.get('form > :nth-child(2) > :nth-child(2)').select('Ana Gómez');
    cy.get('form > :nth-child(2) > :nth-child(3)').select('María López');

    // Envía el formulario
    cy.get('button.bg-blue-600').contains('Guardar').click();

    // Espera la respuesta de error
    cy.wait('@createVueloError');

    // Verifica el mensaje de error en el frontend
    cy.get('[data-cy="error-message"]').contains('El piloto ya tiene un vuelo asignado en la misma fecha').should('be.visible');
  });

  // Caso de prueba 7: Error por avión fuera de servicio
  it('muestra error si el avión está fuera de servicio', () => {
    // Navega a la página de vuelos
    cy.get('[data-cy="sidebar-vuelos"]').click();
    cy.url().should('include', 'http://localhost:5173/vuelos');
    cy.wait(['@getFlights', '@getAirports', '@getWorkers', '@getAircrafts']);

    // Simula la respuesta de error de la API
    cy.intercept('POST', '**/vuelos', {
      statusCode: 400,
      body: { error: 'El avión está fuera de servicio o en mantenimiento y no puede ser asignado a un vuelo' },
    }).as('createVueloError');

    //Espera 6 segundos
    cy.wait(6000);

    // Abre el formulario
    cy.get('button.bg-blue-600').contains('+ Nuevo Vuelo').click();
    cy.contains('Nuevo Vuelo').should('be.visible');

    // Llena el formulario
    cy.get('input[name="numero_vuelo"]').type('FL1234');
    cy.get('select[name="origen"]').select('Aeropuerto Guatemala');
    cy.get('select[name="destino"]').select('Aeropuerto México');
    cy.get('input[name="fecha_salida"]').type('2025-10-02T10:00');
    cy.get('input[name="fecha_llegada"]').type('2025-10-02T12:00');
    cy.get('select[name="aeronave"]').select('Boeing 737'); // Avión fuera de servicio
    cy.get('select[name="piloto_id"]').select('Carlos Lópezaaaaa');
    cy.get('select[name="copiloto_id"]').select('Juan Pérez');
    cy.get('form > :nth-child(2) > :nth-child(2)').select('Ana Gómez');
    cy.get('form > :nth-child(2) > :nth-child(3)').select('María López');

    // Envía el formulario
    cy.get('button.bg-blue-600').contains('Guardar').click();

    // Espera la respuesta de error
    cy.wait('@createVueloError');

    // Verifica el mensaje de error en el frontend
    cy.get('[data-cy="error-message"]').contains('El avión está fuera de servicio o en mantenimiento y no puede ser asignado a un vuelo').should('be.visible');
  });
});