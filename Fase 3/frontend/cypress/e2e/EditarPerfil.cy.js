describe('Editar Perfil', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    // Simula el login
    cy.intercept('POST', '**/users/login', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aXBvIjoicGFzYWplcm8iLCJpZCI6IjY4YmE2ZDljYmM0NmM4MjZjYTViNDZmYyIsImlhdCI6MTcyNzgxNzYwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          usuario: {
            id: '68ba6d9cbc46c826ca5b46fc',
            nombre: 'Carlos Lópezaaaaa',
            correo: 'lopezajvixjoseleonel@gmail.com',
            edad: 28,
            telefono: '+50255555555',
            direccion: 'Zona 15, Ciudad de Guatemala',
            genero: 'Masculino',
            fecha_nacimiento: '2002-09-10T00:00:00.000Z',
            dpi: '1029384756102',
            usuario: 'usuario',
            tipo: 'pasajero',
            pasaporte: {
              numero: 'A12345678',
              fecha_vencimiento: '2030-12-31',
              pais_emision: 'Guatemala',
            },
            activo: true,
          },
        },
      });
    }).as('loginRequest');

    cy.intercept('GET', '**/api/users/68ba6d9cbc46c826ca5b46fc', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          id: '68ba6d9cbc46c826ca5b46fc',
          nombre: 'Carlos Lópezaaaaa',
          correo: 'lopezajvixjoseleonel@gmail.com',
          edad: 28,
          telefono: '+50255555555',
          direccion: 'Zona 15, Ciudad de Guatemala',
          genero: 'Masculino',
          fecha_nacimiento: '2002-09-10T00:00:00.000Z',
          dpi: '1029384756102',
          usuario: 'usuario',
          tipo: 'pasajero',
          pasaporte: {
            numero: 'A12345678',
            fecha_vencimiento: '2030-12-31',
            pais_emision: 'Guatemala',
          },
          activo: true,
        },
      });
    }).as('getProfileRequest');

    // Nuevo intercept para la llamada PUT al editar el perfil
    cy.intercept('PUT', '**/users/perfil', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          _id: '68ba6d9cbc46c826ca5b46fc',
          nombre: req.body.nombre || 'Carlos Lópezaaaaa Actualizado', // Usa el nombre enviado o uno por defecto
          correo: req.body.correo || 'lopezajvixjoseleonel@gmail.com',
          edad: 28,
          telefono: req.body.telefono || '+50255555555',
          direccion: req.body.direccion || 'Zona 15, Ciudad de Guatemala',
          genero: req.body.genero || 'Masculino',
          fecha_nacimiento: '2002-09-10T00:00:00.000Z',
          dpi: '1029384756102',
          usuario: 'usuario',
          tipo: 'pasajero',
          pasaporte: {
            numero: req.body.pasaporte?.numero || 'A12345678',
            fecha_vencimiento: req.body.pasaporte?.fecha_vencimiento || '2030-12-31',
            pais_emision: req.body.pasaporte?.pais_emision || 'Guatemala',
          },
          activo: true,
        },
      });
    }).as('updateProfileRequest');

    // Lógica para visitar la página de editar perfil
    cy.visit('http://localhost:5173/');
    cy.get('.relative > .text-white').click();
    cy.get('#user').type('usuario');
    cy.get('#password').type('1234ABcd');
    cy.get('[data-cy="login-button"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', 'http://localhost:5173/mainpage');
  });

  it('Navega a la página de editar perfil', () => {
    cy.wait(6000);
    cy.get('.relative > .text-white').click();
    cy.get('[data-cy="profile-link"]').click();
    cy.url().should('include', 'http://localhost:5173/profile');
  });

  it('Edita el perfil del usuario', () => {
    cy.wait(6000);
    cy.get('.relative > .text-white').click();
    cy.get('[data-cy="profile-link"]').click();
    cy.url().should('include', 'http://localhost:5173/profile');

    cy.get('[data-cy="nombre-display"]').should('contain', 'Carlos Lópezaaaaa');
    cy.get('[data-cy="correo-display"]').should('contain', 'lopezajvixjoseleonel@gmail.com');
    cy.get('[data-cy="genero-display"]').should('contain', 'Masculino');
    cy.get('[data-cy="pasaporte-numero"]').should('contain', 'A12345678');

    cy.get('button').contains('Editar Perfil').click();
    cy.get('input[name="nombre"]').clear().type('Carlos López Actualizado');
    cy.get('input[name="telefono"]').clear().type('+50299999999');
    cy.get('select[name="genero"]').select('Femenino');
    cy.get('input[name="pasaporte.numero"]').clear().type('B98765432');
    cy.get('input[name="pasaporte.fecha_vencimiento"]').clear().type('2031-12-31');
    cy.get('input[name="pasaporte.pais_emision"]').clear().type('México');
    cy.get('input[name="direccion"]').clear().type('Zona 10, Ciudad de Guatemala');

    cy.get('[data-cy="save-profile-button"]').scrollIntoView().click();
    cy.wait('@updateProfileRequest');

    cy.get('.Toastify__toast--success').should('contain', 'Perfil actualizado correctamente');

    cy.get('[data-cy="nombre-display"]').should('contain', 'Carlos López Actualizado');
    cy.get('[data-cy="telefono-display"]').should('contain', '+50299999999');
    cy.get('[data-cy="genero-display"]').should('contain', 'Femenino');
    cy.get('[data-cy="pasaporte-numero"]').should('contain', 'B98765432');
    //cy.get('[data-cy="pasaporte-pais"]').should('contain', 'México');
    //cy.get('[data-cy="direccion-display"]').should('contain', 'Zona 10, Ciudad de Guatemala');
  });
});