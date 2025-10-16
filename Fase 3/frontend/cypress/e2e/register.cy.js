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
    // Mock de interceptación para capturar el submit
    cy.intercept('POST', '**/users', (req) => {
      // No responder, solo verificar que no se llegue aquí
      req.reply({
        statusCode: 400,
        body: { error: 'No debería llegar aquí' }
      });
    }).as('registerRequest');

    cy.get('input[placeholder="Nombre completo"]').type('Juan Pérez');
    cy.get('input[placeholder="Número de DPI"]').type('1234567890123');
    cy.get('input[placeholder="Fecha de nacimiento"]').type('2000-01-15');
    cy.get('select').first().select('Masculino');
    cy.get('input[placeholder="Número de pasaporte"]').type('AB123456');
    cy.get('input[placeholder="País de emisión"]').type('Guatemala');
    cy.get('input[placeholder="Fecha vencimiento"]').type('2026-12-31');
    cy.get('input[placeholder="Dirección"]').type('Zona 10, Ciudad de Guatemala');
    cy.get('input[placeholder="Teléfono"]').type('12345678');
    
    // Usar invoke para cambiar el tipo después de que React haya renderizado
    cy.get('input[placeholder="Correo electrónico"]')
      .invoke('removeAttr', 'type')
      .invoke('attr', 'type', 'text')
      .type('correo@invalido');

    // Esperar un momento para asegurar que el valor se haya establecido
    cy.wait(500);

    cy.get('button[type="submit"]').click();

    // Verificar que aparezca el toast de error
    cy.get('.Toastify__toast--error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Correo inválido');
      
    // Verificar que NO se hizo la petición al servidor
    cy.get('@registerRequest.all').should('have.length', 0);
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
    // Verificar que el botón existe
    cy.get('button[type="submit"]').should('be.visible');

    // Verificar que todos los campos requeridos existen
    cy.get('input[placeholder="Nombre completo"]').should('have.attr', 'required');
    cy.get('input[placeholder="Número de DPI"]').should('have.attr', 'required');
    cy.get('input[placeholder="Fecha de nacimiento"]').should('have.attr', 'required');
    cy.get('select').first().should('have.attr', 'required');
    cy.get('input[placeholder="Número de pasaporte"]').should('have.attr', 'required');
    cy.get('input[placeholder="País de emisión"]').should('have.attr', 'required');
    cy.get('input[placeholder="Fecha vencimiento"]').should('have.attr', 'required');
    cy.get('input[placeholder="Dirección"]').should('have.attr', 'required');
    cy.get('input[placeholder="Correo electrónico"]').should('have.attr', 'required');
    cy.get('input[placeholder="Teléfono"]').should('have.attr', 'required');
  });
});