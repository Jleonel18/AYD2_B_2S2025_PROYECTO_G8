import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_API_URL

const Tripulacion = () => {
    const [tripulacion, setTripulacion] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteCandidateId, setDeleteCandidateId] = useState(null);
    const [formData, setFormData] = useState({
        tipo: 'piloto',
        nombre: '',
        correo: '',
        edad: '',
        telefono: '',
        direccion: '',
        genero: 'Masculino',
        fecha_nacimiento: '',
        dpi: '',
        contrasena: '',
        numero_licencia: '',
    });
    const [editFormData, setEditFormData] = useState(null);

    useEffect(() => {
        fetch(`${apiUrl}/users/trabajadores`, {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        })
        .then((response) => {
            if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Datos recibidos:', data);
            if (Array.isArray(data.trabajadores)) {
            setTripulacion(data.trabajadores);
            } else {
            setError('Datos recibidos en formato incorrecto');
            }
            setIsLoading(false);
        })
        .catch((error) => {
            console.error('Error al obtener la tripulación:', error);
            setError(error.message);
            setIsLoading(false);
        });
    }, []);

    // Calcular edad a partir de fecha de nacimiento
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'N/A';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
        }
        return edad;
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        try {
            const date = new Date(fecha);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    const formatFechaInput = (fecha) => {
        if (!fecha) return '';
        try {
            const date = new Date(fecha);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0]; // Ejemplo: 2002-09-08
        } catch {
            return '';
        }
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    // Cambiarlo a async/await
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const edad = calcularEdad(formData.fecha_nacimiento);
            formData.edad = edad;

            const payload = {
                tipo: formData.tipo,
                datos: {
                    nombre: formData.nombre,
                    correo: formData.correo,
                    telefono: formData.telefono,
                    direccion: formData.direccion,
                    genero: formData.genero,
                    edad,
                    fecha_nacimiento: formData.fecha_nacimiento,
                    dpi: formData.dpi,
                    contrasena: formData.contrasena,
                    ...(formData.tipo === 'piloto' && { numero_licencia: formData.numero_licencia }),
                },
            }

            console.log(payload);

            const response = await fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if(response.status !== 201) {
                toast.error(data.error || "Error al agregar tripulante");
                return;
            }

            const nuevoUsuario = data
            setTripulacion([...tripulacion, nuevoUsuario]);
            setIsModalOpen(false);
            setFormData({
                tipo: 'piloto',
                nombre: '',
                correo: '',
                telefono: '',
                edad: '',
                direccion: '',
                genero: 'Masculino',
                fecha_nacimiento: '',
                dpi: '',
                contrasena: '',
                numero_licencia: '',
            });

            toast.success("Tripulante agregado exitosamente");
        }catch (error) {
            console.error('Error al agregar tripulante:', error);
            toast.error("Error al agregar tripulante");
        }
    };

    // Funciones para acciones
    const handleVerDetalles = async (id) => {
        try {

            const response = await fetch(`${apiUrl}/users/trabajadores/${id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });

            const data = await response.json();

            if(response.status !== 200) {
                toast.error(data.error || "Error al obtener detalles del tripulante");
                return;
            }

            setSelectedUsuario(data);
            setIsDetailsModalOpen(true);

        }catch (error) {
            console.error('Error al obtener detalles del tripulante:', error);
            toast.error("Error al obtener detalles del tripulante");
        }
    };

    const handleEditar = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/users/trabajadores/${id}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.status !== 200) {
                throw new Error(data.error || 'Error al obtener datos del tripulante');
            }
            console.log("Este es el id del tripulante a editar:", id, data._id);
            // Preparar datos para el formulario de edición
            setEditFormData({
                id: data._id || id,
                tipo: data.tipo || 'piloto',
                nombre: data.datos?.nombre || data.nombre || '',
                correo: data.datos?.correo || data.correo || '',
                telefono: data.datos?.telefono || data.telefono || '',
                direccion: data.datos?.direccion || data.direccion || '',
                genero: data.datos?.genero || data.genero || 'Masculino',
                fecha_nacimiento: formatFechaInput(data.datos?.fecha_nacimiento || data.fecha_nacimiento),
                dpi: data.datos?.dpi || data.dpi || '',
                contrasena: '', // No pre-cargamos la contraseña por seguridad
                numero_licencia: data.datos?.numero_licencia || data.numero_licencia || '',
            });

            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error al preparar edición:', error);
            toast.error(`Error al preparar edición: ${error.message}`);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: editFormData.nombre,
                correo: editFormData.correo,
                edad: calcularEdad(editFormData.fecha_nacimiento),
                telefono: editFormData.telefono,
                direccion: editFormData.direccion,
                genero: editFormData.genero,
                fecha_nacimiento: editFormData.fecha_nacimiento,
                dpi: editFormData.dpi,
                ...(editFormData.contrasena && { contrasena: editFormData.contrasena }),
                ...(editFormData.tipo === 'piloto' && { numero_licencia: editFormData.numero_licencia }),
            };

            console.log('Payload enviado (editar):', payload, editFormData);

            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/users/trabajadores/${editFormData.id}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.status !== 200) {
                throw new Error(data.error || 'Error al actualizar tripulante');
            }

            // Actualizar la lista de tripulantes
            setTripulacion(tripulacion.map((usuario) =>
                usuario._id === editFormData.id ? data : usuario
            ));
            setIsEditModalOpen(false);
            setEditFormData(null);
            toast.success('Tripulante actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar tripulante:', error);
            toast.error(`Error al actualizar tripulante: ${error.message}`);
        }
    };

    const handleEliminar = (id) => {
        if (!id) {
            toast.error('ID de tripulante no válido');
            return;
        }
        setDeleteCandidateId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmEliminar = async () => {
        if (!deleteCandidateId) {
            toast.error('ID de tripulante no válido');
            setIsDeleteModalOpen(false);
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/users/trabajadores/${deleteCandidateId}`, {
                method: 'DELETE',
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Error HTTP: ${response.status} ${response.statusText}`);
            }

            setTripulacion(tripulacion.filter((usuario) => usuario._id !== deleteCandidateId));
            setIsDeleteModalOpen(false);
            setDeleteCandidateId(null);
            toast.success('Tripulante eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar tripulante:', error);
            toast.error(`Error al eliminar tripulante: ${error.message}`);
            setIsDeleteModalOpen(false);
            setDeleteCandidateId(null);
        }
    };

    return (
        <div className="p-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Tripulación</h1>
            <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
            + Nuevo Tripulante
            </button>
        </div>
        {/* Estadísticas rápidas */}
        {isLoading ? (
            <p className="text-gray-600">Cargando tripulación...</p>
        ) : error ? (
            <p className="text-red-600">Error: {error}</p>
        ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800">Pilotos</h3>
                <p className="text-2xl font-bold text-blue-600">
                    {tripulacion.filter((u) => u.tipo === 'piloto').length}
                </p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">Sobrecargos</h3>
                <p className="text-2xl font-bold text-green-600">
                    {tripulacion.filter((u) => u.tipo === 'sobrecargo').length}
                </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800">Total</h3>
                <p className="text-2xl font-bold text-gray-600">{tripulacion.length}</p>
                </div>
            </div>

            {/* Tabla de tripulación */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tripulacion.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay tripulantes disponibles
                        </td>
                    </tr>
                    ) : (
                    tripulacion.map((usuario) => (
                        <tr key={usuario._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {usuario.nombre || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {usuario.tipo ? usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {usuario.usuario || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {usuario.correo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {usuario.telefono || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {usuario.edad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                            onClick={() => handleVerDetalles(usuario._id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                            >
                            👁️
                            </button>
                            <button
                            onClick={() => handleEditar(usuario._id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                            >
                            ✏️
                            </button>
                            <button
                            onClick={() => handleEliminar(usuario._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                            >
                            🗑️
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            </>
        )}

        {/* Modal para agregar tripulante */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar Tripulante</h2>
                <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="piloto">Piloto</option>
                        <option value="sobrecargo">Sobrecargo</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Correo</label>
                    <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Género</label>
                    <select
                        name="genero"
                        value={formData.genero}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <input
                        type="date"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">DPI</label>
                    <input
                        type="text"
                        name="dpi"
                        value={formData.dpi}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                        type="password"
                        name="contrasena"
                        value={formData.contrasena}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    {formData.tipo === 'piloto' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Número de Licencia</label>
                        <input
                        type="text"
                        name="numero_licencia"
                        value={formData.numero_licencia}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                        />
                    </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                    onClick={() => setIsModalOpen(false)}
                    >
                    Cancelar
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                    Agregar
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        {/* Modal para ver detalles */}
        {isDetailsModalOpen && selectedUsuario && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalles del Tripulante ({selectedUsuario.usuario})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="mt-1 text-sm text-gray-900">
                    {selectedUsuario.tipo ? selectedUsuario.tipo.charAt(0).toUpperCase() + selectedUsuario.tipo.slice(1) : 'N/A'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">
                    { selectedUsuario.nombre || 'N/A'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Correo</label>
                    <p className="mt-1 text-sm text-gray-900">
                    { selectedUsuario.correo || 'N/A'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="mt-1 text-sm text-gray-900">
                    { selectedUsuario.telefono || 'N/A'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <p className="mt-1 text-sm text-gray-900">
                    { selectedUsuario.direccion || 'N/A'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Género</label>
                    <p className="mt-1 text-sm text-gray-900">
                    {selectedUsuario.genero || 'N/A'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <p className="mt-1 text-sm text-gray-900">
                    { formatFecha(selectedUsuario.fecha_nacimiento) || 'N/A'}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Edad</label>
                    <p className="mt-1 text-sm text-gray-900">
                    {selectedUsuario.edad}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">DPI</label>
                    <p className="mt-1 text-sm text-gray-900">
                    {selectedUsuario.dpi || 'N/A'}
                    </p>
                </div>
                {selectedUsuario.tipo === 'piloto' && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Licencia</label>
                    <p className="mt-1 text-sm text-gray-900">
                        {selectedUsuario.numero_licencia || 'N/A'}
                    </p>
                    </div>
                )}
                </div>
                <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                    onClick={() => setIsDetailsModalOpen(false)}
                >
                    Cerrar
                </button>
                </div>
            </div>
            </div>
        )}
        {/* Modal para editar tripulante */}
        {isEditModalOpen && editFormData && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Tripulante</h2>
                <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                        name="tipo"
                        value={editFormData.tipo}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="piloto">Piloto</option>
                        <option value="sobrecargo">Sobrecargo</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={editFormData.nombre}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Correo</label>
                    <input
                        type="email"
                        name="correo"
                        value={editFormData.correo}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={editFormData.telefono}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <input
                        type="text"
                        name="direccion"
                        value={editFormData.direccion}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Género</label>
                    <select
                        name="genero"
                        value={editFormData.genero}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <input
                        type="date"
                        name="fecha_nacimiento"
                        value={editFormData.fecha_nacimiento}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">DPI</label>
                    <input
                        type="text"
                        name="dpi"
                        value={editFormData.dpi}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña (dejar en blanco para no cambiar)</label>
                    <input
                        type="password"
                        name="contrasena"
                        value={editFormData.contrasena}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nueva contraseña (opcional)"
                    />
                    </div>
                    {editFormData.tipo === 'piloto' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Número de Licencia</label>
                        <input
                        type="text"
                        name="numero_licencia"
                        value={editFormData.numero_licencia}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                        />
                    </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                    onClick={() => {
                        setIsEditModalOpen(false);
                        setEditFormData(null);
                    }}
                    >
                    Cancelar
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                    Guardar
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        {/* Modal de confirmación para eliminar */}
        {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Eliminación</h2>
                <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar a este tripulante? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                    onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteCandidateId(null);
                    }}
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    onClick={confirmEliminar}
                >
                    Confirmar
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
};

export default Tripulacion;