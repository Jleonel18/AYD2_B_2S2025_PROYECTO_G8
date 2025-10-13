describe('Pruebas de Registro', () => {
  beforeEach(() => {
    // Visita la página de registro
    cy.visit('http://localhost:5173/register', { timeout: 20000 });

    // Limpiar localStorage y sessionStorage antes de cada prueba
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  it('Debería registrar un usuario con datos válidos', () => {
    // Mock de la petición POST exitosa
    cy.intercept('POST', '**/users', {
      statusCode: 200,
      body: {
        message: 'Usuario registrado exitosamente',
        usuario: { tipo: 'pasajero', nombre: 'Juan Pérez' },
      },
    }).as('registerRequest');

    // Llenar el formulario con datos válidos
    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type('2000-01-15');
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('juan.perez@ejemplo.com');
    cy.get('input[placeholder="Teléfono"]').type('12345678');

    // Enviar formulario
    cy.get('button[type="submit"]').click();

    // Esperar al mock
    cy.wait('@registerRequest');

    // Verificar toast de éxito
    cy.get('.Toastify__toast--success', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Se han validado tus datos');

    // Verificar redirección a login
    cy.url().should('include', '/login');
  });

  it('Debería mostrar error si la fecha de nacimiento es en el futuro', () => {
    const fechaFutura = new Date();
    fechaFutura.setFullYear(fechaFutura.getFullYear() + 1);
    const fechaFuturaStr = fechaFutura.toISOString().split('T')[0];

    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type(fechaFuturaStr);
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('juan.perez@ejemplo.com');
    cy.get('input[placeholder="Teléfono"]').type('12345678');

    cy.get('button[type="submit"]').click();

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'La fecha de nacimiento no puede ser en el futuro');
  });

  it('Debería mostrar error si el usuario es menor de 18 años', () => {
    const fechaMenor = new Date();
    fechaMenor.setFullYear(fechaMenor.getFullYear() - 17);
    const fechaMenorStr = fechaMenor.toISOString().split('T')[0];

    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type(fechaMenorStr);
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('juan.perez@ejemplo.com');
    cy.get('input[placeholder="Teléfono"]').type('12345678');

    cy.get('button[type="submit"]').click();

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'La edad debe ser mayor o igual a 18 años');
  });

  it('Debería mostrar error con correo electrónico inválido', () => {
    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type('2000-01-15');
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('correo-invalido');
    cy.get('input[placeholder="Teléfono"]').type('12345678');

    cy.get('button[type="submit"]').click();

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Correo inválido');
  });

  it('Debería mostrar error si el teléfono tiene menos de 8 caracteres', () => {
    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type('2000-01-15');
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('juan.perez@ejemplo.com');
    cy.get('input[placeholder="Teléfono"]').type('1234567');

    cy.get('button[type="submit"]').click();

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'El teléfono debe tener al menos 8 caracteres');
  });

  it('Debería mostrar error si el DPI tiene menos de 13 caracteres', () => {
    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('123456789012'); // 12 caracteres
    cy.get('input[placeholder="Fecha de nacimiento"]').type('2000-01-15');
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('juan.perez@ejemplo.com');
    cy.get('input[placeholder="Teléfono"]').type('12345678');

    cy.get('button[type="submit"]').click();

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'El DPI debe tener al menos 13 caracteres');
  });

  it('Debería mostrar error si el pasaporte está vencido', () => {
    const fechaVencida = new Date();
    fechaVencida.setFullYear(fechaVencida.getFullYear() - 1);
    const fechaVencidaStr = fechaVencida.toISOString().split('T')[0];

    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type('2000-01-15');
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type(fechaVencidaStr);
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('juan.perez@ejemplo.com');
    cy.get('input[placeholder="Teléfono"]').type('12345678');

    cy.get('button[type="submit"]').click();

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'El pasaporte no debe estar vencido');
  });

  it('Debería mostrar error del servidor al intentar registrar', () => {
    // Mock de error del servidor
    cy.intercept('POST', '**/users', {
      statusCode: 400,
      body: {
        error: 'El correo ya está registrado',
      },
    }).as('registerRequest');

    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type('2000-01-15');
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('existente@ejemplo.com');
    cy.get('input[placeholder="Teléfono"]').type('12345678');

    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest');

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'El correo ya está registrado');
  });

  it('Debería mostrar error genérico si falla la conexión', () => {
    // Mock de error de conexión
    cy.intercept('POST', '**/users', {
      forceNetworkError: true,
    }).as('registerRequest');

    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type('2000-01-15');
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Correo electrónico"]').type('juan.perez@ejemplo.com');
    cy.get('input[placeholder="Teléfono"]').type('12345678');

    cy.get('button[type="submit"]').click();

    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Error en el registro');
  });

  it('Debería redirigir al login al hacer clic en "¿Ya tienes cuenta?"', () => {
    cy.get('p').contains('¿Ya tienes cuenta? Inicia sesión').click();

    cy.url().should('include', '/login');
  });

  it('Debería validar que todos los campos requeridos estén presentes', () => {
    // Intentar enviar el formulario sin llenar campos
    cy.get('button[type="submit"]').click();

    // HTML5 validará automáticamente, no llegará a enviar
    // Verificar que no se hizo ninguna petición
    cy.get('@registerRequest.all').should('have.length', 0);
  });
});