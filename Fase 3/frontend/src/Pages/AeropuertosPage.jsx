import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_API_URL;

const AeropuertosPage = () => {
    const [aeropuertos, setAeropuertos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteCandidateId, setDeleteCandidateId] = useState(null);
    const [selectedAeropuerto, setSelectedAeropuerto] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        ciudad: '',
        pais: '',
        codigoIATA: '',
        codigoICAO: '',
    });
    const [editFormData, setEditFormData] = useState(null);

    // Fetch all airports
    useEffect(() => {
        const fetchAeropuertos = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/aeropuertos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La respuesta no es JSON');
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);
            if (Array.isArray(data)) {
                setAeropuertos(data);
            } else {
                throw new Error('Datos recibidos en formato incorrecto');
            }
        } catch (error) {
            console.error('Error al obtener los aeropuertos:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
        };

        fetchAeropuertos();
    }, []);

    // Handle input changes for add form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle input changes for edit form
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    // Submit form to add airport
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: formData.nombre,
                ciudad: formData.ciudad,
                pais: formData.pais,
                codigoIATA: formData.codigoIATA,
                codigoICAO: formData.codigoICAO,
            };

            console.log('Payload enviado (agregar):', payload);

            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/aeropuertos`, {
                method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.status !== 201) {
                throw new Error(data.error || 'Error al agregar aeropuerto');
            }

            setAeropuertos([...aeropuertos, data]);
            setIsModalOpen(false);
            setFormData({
                nombre: '',
                ciudad: '',
                pais: '',
                codigoIATA: '',
                codigoICAO: '',
            });

            toast.success('Aeropuerto agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar aeropuerto:', error);
            toast.error(`Error al agregar aeropuerto: ${error.message}`);
        }
    };

    // Get airport details
    const handleVerDetalles = async (id) => {
        if (!id) {
            toast.error('ID de aeropuerto no válido');
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/aeropuertos/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.status !== 200) {
                throw new Error(data.error || 'Error al obtener detalles del aeropuerto');
            }

            setSelectedAeropuerto(data);
            setIsDetailsModalOpen(true);
        } catch (error) {
            console.error('Error al obtener detalles del aeropuerto:', error);
            toast.error(`Error al obtener detalles del aeropuerto: ${error.message}`);
        }
    };

    // Prepare edit form
    const handleEditar = async (id) => {
        if (!id) {
            toast.error('ID de aeropuerto no válido');
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/aeropuertos/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.status !== 200) {
                throw new Error(data.error || 'Error al obtener datos del aeropuerto');
            }

            setEditFormData({
                id: data._id || data.id,
                nombre: data.nombre || '',
                ciudad: data.ciudad || '',
                pais: data.pais || '',
                codigoIATA: data.codigoIATA || '',
                codigoICAO: data.codigoICAO || '',
            });

            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error al preparar edición:', error);
            toast.error(`Error al preparar edición: ${error.message}`);
        }
    };

    // Submit form to edit airport
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editFormData?.id) {
            toast.error('ID de aeropuerto no válido');
            return;
        }
        try {
            const payload = {
                nombre: editFormData.nombre,
                ciudad: editFormData.ciudad,
                pais: editFormData.pais,
                codigoIATA: editFormData.codigoIATA,
                codigoICAO: editFormData.codigoICAO,
            };

            console.log('Payload enviado (editar):', payload);

            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/aeropuertos/${editFormData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.status !== 200) {
                throw new Error(data.error || 'Error al actualizar aeropuerto');
            }

            setAeropuertos(aeropuertos.map((aeropuerto) =>
                aeropuerto._id === editFormData.id ? data : aeropuerto
            ));
            setIsEditModalOpen(false);
            setEditFormData(null);
            toast.success('Aeropuerto actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar aeropuerto:', error);
            toast.error(`Error al actualizar aeropuerto: ${error.message}`);
        }
    };

    // Show delete confirmation dialog
    const handleEliminar = (id) => {
        if (!id) {
            toast.error('ID de aeropuerto no válido');
            return;
        }
        setDeleteCandidateId(id);
        setIsDeleteModalOpen(true);
    };

    // Confirm deletion
    const confirmEliminar = async () => {
        if (!deleteCandidateId) {
            toast.error('ID de aeropuerto no válido');
            setIsDeleteModalOpen(false);
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/aeropuertos/${deleteCandidateId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Error HTTP: ${response.status} ${response.statusText}`);
            }

            setAeropuertos(aeropuertos.filter((aeropuerto) => aeropuerto._id !== deleteCandidateId));
            setIsDeleteModalOpen(false);
            setDeleteCandidateId(null);
            toast.success('Aeropuerto eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar aeropuerto:', error);
            toast.error(`Error al eliminar aeropuerto: ${error.message}`);
            setIsDeleteModalOpen(false);
            setDeleteCandidateId(null);
        }
    };

    return (
        <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Aeropuertos</h1>
            <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
            + Nuevo Aeropuerto
            </button>
        </div>

        {/* Stats */}
        {isLoading ? (
            <p className="text-gray-600">Cargando aeropuertos...</p>
        ) : error ? (
            <p className="text-red-600">Error: {error}</p>
        ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800">Total Aeropuertos</h3>
                <p className="text-2xl font-bold text-gray-600">{aeropuertos.length}</p>
                </div>
            </div>

            {/* Airports Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ciudad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        País
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código IATA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código ICAO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {aeropuertos.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay aeropuertos disponibles
                        </td>
                    </tr>
                    ) : (
                    aeropuertos.map((aeropuerto) => (
                        <tr key={aeropuerto._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {aeropuerto.nombre || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {aeropuerto.ciudad || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {aeropuerto.pais || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {aeropuerto.codigoIATA || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {aeropuerto.codigoICAO || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                            onClick={() => handleVerDetalles(aeropuerto._id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                            >
                            👁️
                            </button>
                            <button
                            onClick={() => handleEditar(aeropuerto._id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                            >
                            ✏️
                            </button>
                            <button
                            onClick={() => handleEliminar(aeropuerto._id)}
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

        {/* Add Airport Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar Aeropuerto</h2>
                <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                    <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">País</label>
                    <input
                        type="text"
                        name="pais"
                        value={formData.pais}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Código IATA</label>
                    <input
                        type="text"
                        name="codigoIATA"
                        value={formData.codigoIATA}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Código ICAO</label>
                    <input
                        type="text"
                        name="codigoICAO"
                        value={formData.codigoICAO}
                        onChange={handleInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
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

        {/* Details Modal */}
        {isDetailsModalOpen && selectedAeropuerto && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalles del Aeropuerto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAeropuerto.nombre || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAeropuerto.ciudad || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">País</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAeropuerto.pais || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Código IATA</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAeropuerto.codigoIATA || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Código ICAO</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAeropuerto.codigoICAO || 'N/A'}</p>
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

        {/* Edit Airport Modal */}
        {isEditModalOpen && editFormData && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Aeropuerto</h2>
                <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                    <input
                        type="text"
                        name="ciudad"
                        value={editFormData.ciudad}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">País</label>
                    <input
                        type="text"
                        name="pais"
                        value={editFormData.pais}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Código IATA</label>
                    <input
                        type="text"
                        name="codigoIATA"
                        value={editFormData.codigoIATA}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Código ICAO</label>
                    <input
                        type="text"
                        name="codigoICAO"
                        value={editFormData.codigoICAO}
                        onChange={handleEditInputChange}
                        className="mt-1 w-full border border-gray-300 p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    </div>
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

        {/* Delete Confirmation Dialog */}
        {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Eliminación</h2>
                <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar este aeropuerto? Esta acción no se puede deshacer.
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

export default AeropuertosPage;