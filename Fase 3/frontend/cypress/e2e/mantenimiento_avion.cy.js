describe('Mantenimiento de Aviones', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mock login
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

    // Mock lista de aviones
    cy.intercept('GET', '**/aviones/', {
      statusCode: 200,
      body: [
        {
          _id: 'aircraft1',
          modelo: 'Boeing 737',
          capacidadMaxima: 100,
          estado: 'Disponible',
          numeroSerie: 'SN-1234',
          horas_Vuelo: 80,
          limite_horas: 100,
        },
      ],
    }).as('getAviones');

    // Mock aeropuertos
    cy.intercept('GET', '**/aeropuertos/', {
      statusCode: 200,
      body: [
        { _id: 'airport1', nombre: 'Aeropuerto Guatemala', codigo: 'GUA' },
        { _id: 'airport2', nombre: 'Aeropuerto México', codigo: 'MEX' },
      ],
    }).as('getAeropuertos');

    // Entrar al sistema
    cy.visit('http://localhost:5173/');
    cy.get('.relative > .text-white').click();
    cy.get('#user').type('admin');
    cy.get('#password').type('1234ABcd');
    cy.get('[data-cy="login-button"]').click();
    cy.wait('@loginMock');
    cy.url().should('include', 'http://localhost:5173/dashboard-admin');
  });

  it('cambia un avión a estado "Mantenimiento"', () => {
    // Ir a la página de aviones
    cy.get('[data-cy="sidebar-aviones"]').click();
    cy.url().should('include', '/aviones');
    cy.wait(['@getAviones', '@getAeropuertos']);

    // Verificar que el avión existe
    cy.contains('Boeing 737').should('be.visible');

    // Abrir formulario de edición
    cy.contains('td', 'Boeing 737')
      .parent('tr')
      .find('button[title="Editar"]')
      .click();

    cy.contains('Editar Avión').should('be.visible');

    // Intercept para PUT de updateAvion
    cy.intercept('PUT', '**/aviones/aircraft1', {
      statusCode: 200,
      body: {
        _id: 'aircraft1',
        modelo: 'Boeing 737',
        capacidadMaxima: 100,
        estado: 'Mantenimiento', // lo que esperamos
        numeroSerie: 'SN-1234',
        horas_Vuelo: 80,
        limite_horas: 100,
      },
    }).as('updateAvion');

    // Cambiar estado a Mantenimiento
    cy.get('[data-cy="select-estado"]').select('Mantenimiento');

    // Guardar cambios
    cy.get('button.bg-blue-600').contains('Guardar').click();
    cy.wait('@updateAvion');

    // Verificar que el estado cambió en la tabla
    cy.contains('Boeing 737').parent().contains('Mantenimiento').should('be.visible');
  });

  it('pone un avión en Disponible y reinicia horas de vuelo después del mantenimiento', () => {
    // Mock lista de aviones ya en Mantenimiento
    cy.intercept('GET', '**/aviones/', {
      statusCode: 200,
      body: [
        {
          _id: 'aircraft1',
          modelo: 'Boeing 737',
          capacidadMaxima: 100,
          estado: 'Mantenimiento', // ahora sí empieza en Mantenimiento
          numeroSerie: 'SN-1234',
          horas_Vuelo: 80,
          limite_horas: 100,
        },
      ],
    }).as('getAvionesMantenimiento');

    // Ir a la página de aviones
    cy.get('[data-cy="sidebar-aviones"]').click();
    cy.url().should('include', '/aviones');
    cy.wait(['@getAvionesMantenimiento', '@getAeropuertos']);

    // Verificar que el avión existe y está en Mantenimiento
    cy.contains('Boeing 737').parent().contains('Mantenimiento').should('be.visible');

    // Abrir formulario de edición
    cy.contains('td', 'Boeing 737')
      .parent('tr')
      .find('button[title="Editar"]')
      .click();

    cy.contains('Editar Avión').should('be.visible');

    // Intercept para PUT de updateAvion a Disponible
    cy.intercept('PUT', '**/aviones/aircraft1', {
      statusCode: 200,
      body: {
        _id: 'aircraft1',
        modelo: 'Boeing 737',
        capacidadMaxima: 100,
        estado: 'Disponible', // ahora Disponible
        numeroSerie: 'SN-1234',
        horas_Vuelo: 0, // se reinician horas de vuelo
        limite_horas: 100,
      },
    }).as('updateAvionDisponible');

    // Cambiar estado a Disponible
    cy.get('[data-cy="select-estado"]').select('Disponible');

    // Guardar cambios
    cy.get('button.bg-blue-600').contains('Guardar').click();
    cy.wait('@updateAvionDisponible');

    // Verificar que el estado cambió a Disponible y horas_Vuelo = 0
    cy.contains('Boeing 737')
      .parent()
      .within(() => {
        cy.contains('Disponible').should('be.visible');
        cy.contains('0').should('be.visible'); // asumiendo que en la tabla se muestra horas_Vuelo
      });
  });

  it('muestra error si falla la carga de aviones', () => {
    // Intercept que simula error al cargar aviones
    cy.intercept('GET', '**/aviones/', {
      statusCode: 500,
      body: { message: 'Error del servidor' }
    }).as('getAvionesError');

    // Ir a la página de aviones
    cy.get('[data-cy="sidebar-aviones"]').click();
    cy.wait('@getAvionesError');

    // Comprobar que se muestra el error
    cy.contains('Error: Error al cargar los aviones').should('be.visible');
  });
});