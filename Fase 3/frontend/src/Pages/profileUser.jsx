import React, { useState, useEffect } from "react";
import NavbarComponent from "../components/navbarComponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const apiUrl = import.meta.env.VITE_API_URL;

const ProfileUser = () => {
  const [user, setUser] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const usuarioStorage = sessionStorage.getItem("user")
  const idUsuario = usuarioStorage ? JSON.parse(usuarioStorage).id : null;
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // New state for cancel confirmation modal
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    genero: "",
    telefono: "",
    direccion: "",
    pasaporte: { numero: "", fecha_vencimiento: "", pais_emision: "" },
  });
  const hasToken = !!sessionStorage.getItem("token");

  useEffect(() => {
    if (hasToken) {
      fetch(`${apiUrl}/users/${idUsuario}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
          setFormData({
            nombre: data.nombre || "",
            correo: data.correo || "",
            genero: data.genero || "",
            telefono: data.telefono || "",
            direccion: data.direccion || "",
            pasaporte: {
              numero: data.pasaporte?.numero || "",
              fecha_vencimiento: data.pasaporte?.fecha_vencimiento || "",
              pais_emision: data.pasaporte?.pais_emision || "",
            },
          });
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [hasToken]);

  const isPasajero = hasToken && user.tipo === "pasajero";
  const showEditButton = isPasajero;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("es-ES", options).replace(/ de /g, " ");
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("pasaporte.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        pasaporte: { ...formData.pasaporte, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasToken) {
      const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      fetch(`${apiUrl}/users/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
          data.id = storedUser.id;
          sessionStorage.setItem("user", JSON.stringify(data));
          toast.success("Perfil actualizado correctamente", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
          closeModal();
        })
        .catch((error) => {
          console.error("Error updating user data:", error);
          toast.error("Error al actualizar el perfil", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        });
    }
  };

  const handleCancelAccount = () => {
    if (hasToken) {
      const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      fetch(`${apiUrl}/users/${storedUser.id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        }
      })
        .then((response) => {
          if (response.ok) {
            toast.success("Cuenta cancelada correctamente", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
            });
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            window.location.href = "/login";
          } else {
            throw new Error("Error al cancelar la cuenta");
          }
        })
        .catch((error) => {
          console.error("Error cancelling account:", error);
          toast.error("Error al cancelar la cuenta", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        });
      closeCancelModal();
    }
  };

  return (
    <div>
      <NavbarComponent />
      <div className="flex flex-col items-center bg-[#EAEFEF] p-6 min-h-screen">
        <div className="mt-8 bg-[#333446] text-white p-6 rounded-lg w-full max-w-md">
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2">
              <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
                Nombre Completo
              </button>
              <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
                Correo Electrónico
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                {user.nombre || "No especificado"}
              </div>
              <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                {user.correo || "No especificado"}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2">
              <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
                Fecha Nacimiento
              </button>
              <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
                Genero
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                {formatDate(user.fecha_nacimiento) || "No especificada"}
              </div>
              <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                {user.genero || "No especificado"}
              </div>
            </div>
          </div>
          {isPasajero && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2">
                <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
                  Pasaporte
                </button>
                <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
                  Fecha Vencimiento
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                  {user.pasaporte?.numero || "No especificado"}
                </div>
                <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                  {formatDate(user.pasaporte?.fecha_vencimiento) || "No especificado"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
                  País Emisión
                </button>
                <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
                  Teléfono
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                  {user.pasaporte?.pais_emision || "No especificado"}
                </div>
                <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                  {user.telefono || "No especificado"}
                </div>
              </div>
            </div>
          )}
          <div className="mb-6">
            <button className="w-full bg-[#7F8CAA] text-white py-2 rounded">
              Direccion
            </button>
            <div className="bg-[#B8CFCE] h-8 flex items-center px-2 mt-2">
              {user.direccion || "No especificada"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <button
            onClick={handleLogout}
            className="mt-2 bg-[#7F8CAA] text-white px-4 py-2 rounded hover:bg-[#333446] transition"
          >
            Cerrar Sesion
          </button>
          {showEditButton && (
            <button
              onClick={openModal}
              className="mt-2 bg-[#7F8CAA] text-white px-4 py-2 rounded hover:bg-[#333446] transition"
            >
              Editar Perfil
            </button>
          )}
          <button
            onClick={openCancelModal}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Cancelar Cuenta
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#333446]">
              Actualizar Perfil
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block text-[#333446] mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded bg-[#EAEFEF] text-[#333446]"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="correo" className="block text-[#333446] mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded bg-[#EAEFEF] text-[#333446]"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="genero" className="block text-[#333446] mb-2">
                  Género
                </label>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded bg-[#EAEFEF] text-[#333446]"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              {isPasajero && (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="pasaporte.numero"
                      className="block text-[#333446] mb-2"
                    >
                      Número de Pasaporte
                    </label>
                    <input
                      type="text"
                      id="pasaporte.numero"
                      name="pasaporte.numero"
                      value={formData.pasaporte.numero}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded bg-[#EAEFEF] text-[#333446]"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="pasaporte.fecha_vencimiento"
                      className="block text-[#333446] mb-2"
                    >
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      id="pasaporte.fecha_vencimiento"
                      name="pasaporte.fecha_vencimiento"
                      value={formData.pasaporte.fecha_vencimiento}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded bg-[#EAEFEF] text-[#333446]"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="pasaporte.pais_emision"
                      className="block text-[#333446] mb-2"
                    >
                      País de Emisión
                    </label>
                    <input
                      type="text"
                      id="pasaporte.pais_emision"
                      name="pasaporte.pais_emision"
                      value={formData.pasaporte.pais_emision}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded bg-[#EAEFEF] text-[#333446]"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="telefono"
                      className="block text-[#333446] mb-2"
                    >
                      Teléfono
                    </label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded bg-[#EAEFEF] text-[#333446]"
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <label
                  htmlFor="direccion"
                  className="block text-[#333446] mb-2"
                >
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded bg-[#EAEFEF] text-[#333446]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-[#333446] px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#7F8CAA] text-white px-4 py-2 rounded hover:bg-[#B8CFCE] transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCancelModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#333446]">
              Confirmar Cancelación de Cuenta
            </h2>
            <p className="text-[#333446] mb-4">
              ¿Estás seguro de que deseas cancelar tu cuenta? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeCancelModal}
                className="bg-gray-300 text-[#333446] px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCancelAccount}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ProfileUser;