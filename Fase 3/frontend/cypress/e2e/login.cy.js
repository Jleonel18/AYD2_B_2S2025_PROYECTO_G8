describe('Pruebas de Login', () => {
  beforeEach(() => {
    // Visita la página de login con un timeout mayor
    cy.visit('http://localhost:5173/login', { timeout: 20000 });

    // Limpiar localStorage y sessionStorage antes de cada prueba
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  it('Debería iniciar sesión con credenciales válidas (usuario tipo pasajero)', () => {
    cy.intercept('POST', '**/users/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        usuario: { tipo: 'pasajero', nombre: 'Test Pasajero' },
      },
    }).as('loginRequest');

    cy.get('#user').should('be.visible').type('test_pasajero');
    cy.get('#password').should('be.visible').type('contraseña123');

    cy.get('button').contains('Iniciar sesión').click();

    cy.wait('@loginRequest');

    cy.get('.Toastify__toast--success', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Inicio de sesión exitoso');

    cy.url().should('include', '/mainpage');

    cy.window().its('localStorage.token').should('eq', 'fake-jwt-token');
  });

  it('Debería mostrar error con campos vacíos', () => {
    cy.get('button').contains('Iniciar sesión').click();

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Por favor, complete todos los campos.');
  });

  it('Debería mostrar error con credenciales inválidas', () => {
    cy.intercept('POST', '**/users/login', {
      statusCode: 401,
      body: { message: 'Credenciales inválidas' },
    }).as('loginRequest');

    cy.get('#user').should('be.visible').type('usuario_inexistente');
    cy.get('#password').should('be.visible').type('contraseña_erronea');

    cy.get('button').contains('Iniciar sesión').click();

    cy.wait('@loginRequest');

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Credenciales inválidas');
  });

  it('Debería abrir el modal de restablecer contraseña y enviar el correo (éxito)', () => {
    // Abrir modal
    cy.get('p').contains('¿Olvidaste tu contraseña?').click();

    // Verificar modal visible (usamos el título para identificarlo exclusivamente)
    cy.contains('h2', 'Restablecer Contraseña').should('be.visible');

    cy.get('#email').should('be.visible').type('test@ejemplo.com');

    // Mock de la petición (todo mockeado)
    cy.intercept('POST', '**/users/recuperar-password', {
      statusCode: 200,
      body: { message: 'Se ha enviado un enlace de restablecimiento a su correo.' },
    }).as('resetPasswordRequest');

    // Enviar solicitud
    cy.get('button').contains('Enviar').click();

    // Esperar al mock
    cy.wait('@resetPasswordRequest');

    // Toast de éxito
    cy.get('.Toastify__toast--success', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Se ha enviado un enlace de restablecimiento a su correo.');

    // Confirmar que el modal se cerró (verificamos el título del modal que identifica sólo el modal)
    cy.contains('h2', 'Restablecer Contraseña', { timeout: 15000 }).should('not.exist');
  });

  it('Debería abrir el modal de restablecer contraseña y manejar error (modal se mantiene)', () => {
    // Abrir modal
    cy.get('p').contains('¿Olvidaste tu contraseña?').click();

    // Verificar modal visible (por su título)
    cy.contains('h2', 'Restablecer Contraseña').should('be.visible');

    cy.get('#email').should('be.visible').type('test@ejemplo.com');

    // Mock de error
    cy.intercept('POST', '**/users/recuperar-password', {
      statusCode: 400,
      body: { error: 'Error al enviar la solicitud de restablecimiento.' },
    }).as('resetPasswordRequest');

    // Enviar solicitud
    cy.get('button').contains('Enviar').click();

    // Esperar al mock
    cy.wait('@resetPasswordRequest');

    // Toast de error
    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Error al enviar la solicitud de restablecimiento.');

    // Modal debería seguir visible (comprobamos por título)
    cy.contains('h2', 'Restablecer Contraseña').should('be.visible');

    // Cerrar con "Cancelar"
    cy.contains('button', 'Cancelar').should('be.visible').click();

    // Confirmar que el modal se cerró
    cy.contains('h2', 'Restablecer Contraseña', { timeout: 15000 }).should('not.exist');
  });

  it('Debería redirigir al registro', () => {
    cy.get('p').contains('Regístrate').click();

    cy.url().should('include', '/register');
  });
});
