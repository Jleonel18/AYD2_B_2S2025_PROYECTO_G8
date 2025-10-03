/// <reference types="cypress" />

describe('Editar Perfil de Pasajero', () => {

  beforeEach(() => {
    // Limpiar storage y cookies para evitar estado previo
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mock de login
    cy.intercept('POST', '**/users/login', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          token: 'fake-jwt-token',
          usuario: {
            _id: 'user123',
            nombre: 'Admin Test',
            correo: 'admin@test.com',
            tipo: 'pasajero',
          }
        }
      });
    }).as('loginMock');

    // Mock de API para obtener usuario
    cy.intercept('GET', '**/users/user123', {
      statusCode: 200,
      body: {
        _id: 'user123',
        nombre: 'Admin Test',
        correo: 'admin@test.com',
        telefono: '+50255555555',
      }
    }).as('getUsuario');

    // Mock de API para actualizar usuario
    cy.intercept('PATCH', '**/users/user123', (req) => {
      if (!req.body.correo.includes('@')) {
        req.reply({
          statusCode: 400,
          body: { error: 'Correo inválido' }
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            _id: 'user123',
            nombre: req.body.nombre,
            correo: req.body.correo,
            telefono: req.body.telefono,
          }
        });
      }
    }).as('updateUsuario');

    // Visitar la página de login
    cy.visit('http://localhost:5173/login');
    cy.get('#user').type('admin');
    cy.get('#password').type('1234ABcd');
    cy.get('[data-cy="login-button"]').click();
    cy.wait('@loginMock');
    cy.url().should('include', '/mainpage'); // ajusta según tu app
  });

  it('permite editar el nombre y teléfono de un pasajero', () => {
    // Navegar al perfil de usuario
    cy.visit('http://localhost:5173/profile');
    cy.wait('@getUsuario');

    // Abrir formulario de edición
    cy.get('[data-cy="edit-profile-button"]').click();

    // Cambiar nombre y teléfono
    cy.get('input[name="nombre"]').clear().type('Nombre Actualizado');
    cy.get('input[name="telefono"]').clear().type('+50212345678');

    // Guardar cambios
    cy.get('button[data-cy="save-profile"]').click();
    cy.wait('@updateUsuario');

    // Verificar cambios en la UI
    cy.contains('Nombre Actualizado').should('be.visible');
    cy.contains('+50212345678').should('be.visible');
  });

  it('muestra error si el correo es inválido', () => {
    cy.visit('http://localhost:5173/profile');
    cy.wait('@getUsuario');

    cy.get('[data-cy="edit-profile-button"]').click();

    // Ingresar correo inválido
    cy.get('input[name="correo"]').clear().type('correo-invalido');

    cy.get('button[data-cy="save-profile"]').click();
    cy.wait('@updateUsuario');

    // Verificar mensaje de error
    cy.get('[data-cy="error-message"]').contains('Correo inválido').should('be.visible');
  });

});
