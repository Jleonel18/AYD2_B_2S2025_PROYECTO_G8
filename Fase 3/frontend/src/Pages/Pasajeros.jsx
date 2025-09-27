import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_API_URL;

const Pasajeros = () => {
    const [pasajeros, setPasajeros] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteCandidateId, setDeleteCandidateId] = useState(null);

    useEffect(() => {
        fetch(`${apiUrl}/users/pasajeros`, {
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
                if (Array.isArray(data)) {
                    setPasajeros(data);
                } else {
                    setError('Datos recibidos en formato incorrecto');
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error al obtener los pasajeros:', error);
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

    const handleVerDetalles = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });

            const data = await response.json();

            if (response.status !== 200) {
                toast.error(data.error || "Error al obtener detalles del pasajero");
                return;
            }

            setSelectedUsuario(data);
            setIsDetailsModalOpen(true);
        } catch (error) {
            console.error('Error al obtener detalles del pasajero:', error);
            toast.error("Error al obtener detalles del pasajero");
        }
    };

    const handleEliminar = (id) => {
        if (!id) {
            toast.error('ID de pasajero no válido');
            return;
        }
        setDeleteCandidateId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmEliminar = async () => {
        if (!deleteCandidateId) {
            toast.error('ID de pasajero no válido');
            setIsDeleteModalOpen(false);
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/users/${deleteCandidateId}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Error HTTP: ${response.status} ${response.statusText}`);
            }

            setPasajeros(pasajeros.filter((usuario) => usuario._id !== deleteCandidateId));
            setIsDeleteModalOpen(false);
            setDeleteCandidateId(null);
            toast.success('Pasajero eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar pasajero:', error);
            toast.error(`Error al eliminar pasajero: ${error.message}`);
            setIsDeleteModalOpen(false);
            setDeleteCandidateId(null);
        }
    };

    return (
        <div className="p-6">
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Pasajeros</h1>
            </div>
            {/* Estadísticas rápidas */}
            {isLoading ? (
                <p className="text-gray-600">Cargando pasajeros...</p>
            ) : error ? (
                <p className="text-red-600">Error: {error}</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800">Total Pasajeros</h3>
                            <p className="text-2xl font-bold text-gray-600">{pasajeros.length}</p>
                        </div>
                    </div>

                    {/* Tabla de pasajeros */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
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
                                {pasajeros.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No hay pasajeros disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    pasajeros.map((usuario) => (
                                        <tr key={usuario._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {usuario.nombre || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {usuario.correo || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {usuario.telefono || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {calcularEdad(usuario.fecha_nacimiento) || 'N/A'}
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

            {/* Modal para ver detalles */}
            {isDetailsModalOpen && selectedUsuario && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalles del Pasajero</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.nombre || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.correo || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.telefono || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.direccion || 'N/A'}
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
                                    {formatFecha(selectedUsuario.fecha_nacimiento) || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Edad</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {calcularEdad(selectedUsuario.fecha_nacimiento) || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Número de Pasaporte</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.pasaporte?.numero || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {formatFecha(selectedUsuario.pasaporte?.fecha_vencimiento) || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">País de Emisión</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.pasaporte?.pais_emision || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">DPI</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.dpi || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.usuario || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Verificación de Email</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.verificacion_email ? 'Verificado' : 'No verificado'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Puntos</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.puntos || 0}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cantidad de Vuelos</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.vuelos?.length || 0} vuelos
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Estado</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedUsuario.activo ? 'Activo' : 'Cancelado'}
                                </p>
                            </div>
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
            {/* Modal de confirmación para eliminar */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Eliminación</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            ¿Estás seguro de que deseas cancelar la cuenta de este pasajero? Esta acción no se puede deshacer.
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
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
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

export default Pasajeros;