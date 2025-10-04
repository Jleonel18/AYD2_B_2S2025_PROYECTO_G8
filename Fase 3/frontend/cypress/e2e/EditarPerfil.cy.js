/// <reference types="cypress" />

describe("Editar Perfil de Pasajero", () => {
  const apiUrl = "http://localhost:3000/api";

  beforeEach(() => {
    // Setear usuario en sessionStorage
    cy.window().then((win) => {
      win.sessionStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          nombre: "Juan Pérez",
          correo: "juan@test.com",
          tipo: "pasajero", // 🔑 necesario para mostrar botón
        })
      );
      win.sessionStorage.setItem("token", "fakeToken123");
    });

    // Interceptar petición GET usuario
    cy.intercept("GET", `${apiUrl}/users/1`, {
      statusCode: 200,
      body: {
        id: 1,
        nombre: "Juan Pérez",
        correo: "juan@test.com",
        genero: "Masculino",
        telefono: "12345678",
        direccion: "Ciudad",
        tipo: "pasajero",
        pasaporte: {
          numero: "P123456",
          fecha_vencimiento: "2030-12-31",
          pais_emision: "Guatemala",
        },
      },
    }).as("getUsuario");

    // Interceptar petición PUT perfil
    cy.intercept("PUT", `${apiUrl}/users/perfil`, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          ...req.body,
          id: 1,
          tipo: "pasajero",
        },
      });
    }).as("updateUsuario");

    // Ir a la página de perfil
    cy.visit("http://localhost:5173/profile");
    cy.wait("@getUsuario");
  });

  it("permite editar el nombre y teléfono de un pasajero", () => {
    // Abrir modal de edición
    cy.contains("Editar Perfil").click();

    // Editar campos
    cy.get('input[name="nombre"]').clear().type("Juan Modificado");
    cy.get('input[name="telefono"]').clear().type("98765432");

    // Guardar cambios
    cy.contains("Guardar").click();

    // Esperar la petición PUT
    cy.wait("@updateUsuario").its("request.body").should((body) => {
      expect(body.nombre).to.equal("Juan Modificado");
      expect(body.telefono).to.equal("98765432");
    });

    // Verificar que se actualice en pantalla
    cy.contains("Juan Modificado");
    cy.contains("98765432");
  });
});
