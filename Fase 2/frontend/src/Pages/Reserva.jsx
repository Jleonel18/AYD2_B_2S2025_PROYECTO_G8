import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import NavbarComponent from '../components/navbarComponent';
import { getUserInfo } from '../utils/auth';
const apiUrl = import.meta.env.VITE_API_URL;

const Reserva = () => {
    const { id_reserva } = useParams();
    const [reserva, setReserva] = useState(null);
    const [vuelo, setVuelo] = useState(null);
    const [avion, setAvion] = useState(null);
    const [aeropuertos, setAeropuertos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
    const [maletas, setMaletas] = useState([{ tipo: 'Mano', peso: '' }]);
    const [userInfo, setUserInfo] = useState(null);

    // Fetch reservation and airports
    useEffect(() => {
        const userInfo = getUserInfo();
        setUserInfo(userInfo);

        const fetchData = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }
            if (!id_reserva) {
                throw new Error('ID de reserva no proporcionado');
            }

            // Fetch reservation
            const reservaResponse = await fetch(`${apiUrl}/reservas/${id_reserva}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!reservaResponse.ok) {
                throw new Error(`Error HTTP: ${reservaResponse.status} ${reservaResponse.statusText}`);
            }
            const reservaData = await reservaResponse.json();
            setReserva(reservaData.reserva);
            setVuelo(reservaData.vuelo);

            // Fetch airplane details (for aeronave model)
            const vueloResponse = await fetch(`${apiUrl}/vuelos/${reservaData.reserva.id_vuelo}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            if (!vueloResponse.ok) {
                throw new Error(`Error HTTP: ${vueloResponse.status} ${vueloResponse.statusText}`);
            }
            const vueloFullData = await vueloResponse.json();
            setAvion(vueloFullData.avion);

            // Fetch airports
            const aeropuertosResponse = await fetch(`${apiUrl}/aeropuertos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!aeropuertosResponse.ok) {
                throw new Error(`Error HTTP: ${aeropuertosResponse.status} ${aeropuertosResponse.statusText}`);
            }
            const aeropuertosData = await aeropuertosResponse.json();
            if (Array.isArray(aeropuertosData)) {
                setAeropuertos(aeropuertosData);
            } else {
                throw new Error('Datos de aeropuertos en formato incorrecto');
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
        };

        fetchData();
    }, [id_reserva]);

    // Get airport name by ID
    const getAirportName = (id) => {
        const airport = aeropuertos.find((a) => a._id === id);
        return airport ? `${airport.nombre} (${airport.codigoIATA})` : 'Desconocido';
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Handle check-in form
    const handleAddMaleta = () => {
        if (maletas.length >= (reserva?.asientos_reservados * 2 + 3)) {
            toast.error(`Máximo ${reserva.asientos_reservados * 2 + 3} maletas permitidas`);
            return;
        }
        setMaletas([...maletas, { tipo: 'Mano', peso: '' }]);
    };

    const handleMaletaChange = (index, field, value) => {
        const newMaletas = [...maletas];
        newMaletas[index] = { ...newMaletas[index], [field]: value };
        setMaletas(newMaletas);
    };

    const handleRemoveMaleta = (index) => {
        setMaletas(maletas.filter((_, i) => i !== index));
    };

    const handleCheckinSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            // Validate luggage
            if (maletas.length === 0) {
                throw new Error('Debe agregar al menos una maleta');
            }
            if (maletas.length > (reserva.asientos_reservados * 2 + 3)) {
                throw new Error(`Máximo ${reserva.asientos_reservados * 2 + 3} maletas permitidas`);
            }
            for (const maleta of maletas) {
                if (!maleta.tipo || !['Mano', 'Viaje'].includes(maleta.tipo)) {
                throw new Error('Tipo de maleta inválido');
                }
                const peso = parseFloat(maleta.peso);
                if (isNaN(peso) || peso <= 0 || peso > 50) {
                throw new Error('El peso debe ser un número entre 0 y 50 libras');
                }
                maleta.peso = peso.toString(); // Ensure peso is a string as per API
            }

            const payload = { maletas };
            console.log('Payload de check-in:', payload);

            const response = await fetch(`${apiUrl}/reservas/checkin/${id_reserva}`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Error HTTP: ${response.status} ${response.statusText}`);
            }

            toast.success('Check-in realizado exitosamente');
            setIsCheckinModalOpen(false);
            setMaletas([{ tipo: 'Mano', peso: '' }]);

            // Refresh reservation data
            const reservaResponse = await fetch(`${apiUrl}/reservas/${id_reserva}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            if (reservaResponse.ok) {
                const reservaData = await reservaResponse.json();
                setReserva(reservaData.reserva);
                setVuelo(reservaData.vuelo);
            }
        } catch (error) {
            console.error('Error al realizar el check-in:', error);
            toast.error(`Error al realizar el check-in: ${error.message}`);
        }
    };

    // Handle status change for operaciones
    const handleStatusChange = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(`${apiUrl}/reservas/actualizar-estado/${id_reserva}`, {
                method: 'POST',
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Error HTTP: ${response.status} ${response.statusText}`);
            }

            toast.success('Estado actualizado exitosamente');

            // Refresh reservation data
            const reservaResponse = await fetch(`${apiUrl}/reservas/${id_reserva}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            if (reservaResponse.ok) {
                const reservaData = await reservaResponse.json();
                setReserva(reservaData.reserva);
                setVuelo(reservaData.vuelo);
            }
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
            toast.error(`Error al actualizar el estado: ${error.message}`);
        }
    };

    const handleDevolverEstado = (estado) => {
        // Agregar colores o estilos según el estado
        switch (estado) {
            case 'Pendiente de Check-in':
                return <span className="text-yellow-600 font-semibold">{estado}</span>;
            case 'Pendiente de Abordaje':
                return <span className="text-blue-600 font-semibold">{estado}</span>;
            case 'Abordado':
                return <span className="text-green-600 font-semibold">{estado}</span>;
            case 'Cancelada':
                return <span className="text-red-600 font-semibold">{estado}</span>;
            default:
                return <span className="text-gray-600 font-semibold">{estado}</span>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
        <NavbarComponent />
        <div className="p-6 w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Detalles de la Reserva</h1>

            {isLoading ? (
            <p className="text-gray-600">Cargando datos de la reserva...</p>
            ) : error ? (
            <p className="text-red-600">Error: {error}</p>
            ) : !reserva || !vuelo || !avion || !userInfo ? (
            <p className="text-red-600">No se encontraron datos de la reserva o usuario</p>
            ) : (
            <>
                {/* Reservation Details */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Información de la Reserva</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Código de Reserva</label>
                    <p className="mt-1 text-sm text-gray-900">{reserva.codigo_reserva}</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Asientos</label>
                    <p className="mt-1 text-sm text-gray-900">{reserva.asientos.join(', ')}</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Reserva</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(reserva.fecha_reserva)}</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <p className="mt-1 text-sm text-gray-900">{handleDevolverEstado(reserva.estado)}</p>
                    </div>
                </div>
                </div>

                {/* Flight Details */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Detalles del Vuelo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Origen</label>
                    <p className="mt-1 text-sm text-gray-900">{getAirportName(vuelo.origen)}</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Destino</label>
                    <p className="mt-1 text-sm text-gray-900">{getAirportName(vuelo.destino)}</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Salida</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(vuelo.fecha_salida)}</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Llegada</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(vuelo.fecha_llegada)}</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Aeronave</label>
                    <p className="mt-1 text-sm text-gray-900">{avion.modelo} ({avion.numeroSerie})</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Estado del Vuelo</label>
                    <p className="mt-1 text-sm text-gray-900">{vuelo.estado}</p>
                    </div>
                </div>
                </div>

                {/* Luggage Details or Action */}
                <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{(userInfo.tipo === "pasajero" || reserva.estado === 'Abordado') ? "Maletas" : "Estado de la Reserva"}</h2>
                {userInfo.tipo === 'pasajero' && reserva.estado === 'Pendiente de Check-in' ? (
                    <>
                    <p className="text-sm text-gray-600 mb-4">
                        Por cada asiento reservado, tienes derecho a 2 maletas de hasta 50 libras. Puedes agregar hasta 3
                        maletas extras. Total máximo: {reserva.asientos_reservados * 2 + 3} maletas.
                    </p>
                    <button
                        onClick={() => setIsCheckinModalOpen(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Realizar Check-in
                    </button>
                    </>
                ) : userInfo.tipo === 'operaciones' && reserva.estado !== 'Abordado' ? (
                    <>
                    <p className="text-sm text-gray-600 mb-4">Actualizar el estado de la reserva.</p>
                    <button
                        onClick={handleStatusChange}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Cambiar Estado
                    </button>
                    </>
                ) : (
                    <>
                    {reserva.maletas.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                        {reserva.maletas.map((maleta, index) => (
                            <div key={index} className="flex space-x-4">
                            <p className="text-sm text-gray-900">
                                Maleta {index + 1}: {maleta.tipo}, {maleta.peso} libras
                            </p>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600">No se han registrado maletas.</p>
                    )}
                    </>
                )}
                </div>

                {/* Check-in Modal */}
                {isCheckinModalOpen && userInfo.tipo === 'pasajero' && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Realizar Check-in</h2>
                    <form onSubmit={handleCheckinSubmit}>
                        {maletas.map((maleta, index) => (
                        <div key={index} className="flex space-x-4 mb-4 items-center">
                            <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Tipo de Maleta</label>
                            <select
                                value={maleta.tipo}
                                onChange={(e) => handleMaletaChange(index, 'tipo', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="Mano">Mano</option>
                                <option value="Viaje">Viaje</option>
                            </select>
                            </div>
                            <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Peso (libras)</label>
                            <input
                                type="number"
                                value={maleta.peso}
                                onChange={(e) => handleMaletaChange(index, 'peso', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                min="0"
                                max="50"
                                step="0.1"
                            />
                            </div>
                            {maletas.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveMaleta(index)}
                                className="mt-6 text-red-600 hover:text-red-800"
                            >
                                Eliminar
                            </button>
                            )}
                        </div>
                        ))}
                        <button
                        type="button"
                        onClick={handleAddMaleta}
                        className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                        >
                        Agregar Maleta
                        </button>
                        <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setIsCheckinModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            Confirmar Check-in
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
                )}
            </>
            )}
        </div>
        </div>
    );
};

export default Reserva;