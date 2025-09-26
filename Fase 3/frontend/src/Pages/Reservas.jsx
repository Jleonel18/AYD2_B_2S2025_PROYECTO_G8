import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import NavbarComponent from '../components/navbarComponent';
const apiUrl = import.meta.env.VITE_API_URL;

const Reservas = () => {
    const [reservas, setReservas] = useState([]);
    const [vuelos, setVuelos] = useState({});
    const [aeropuertos, setAeropuertos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch reservations, flights, and airports
    useEffect(() => {
        const fetchData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            // Fetch reservations
            const reservasResponse = await fetch(`${apiUrl}/reservas/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!reservasResponse.ok) {
                throw new Error(`Error HTTP: ${reservasResponse.status} ${reservasResponse.statusText}`);
            }
            const reservasData = await reservasResponse.json();
            if (!Array.isArray(reservasData)) {
                throw new Error('Datos de reservas en formato incorrecto');
            }
            setReservas(reservasData);

            // Fetch flight details for each reservation
            const vueloIds = [...new Set(reservasData.map((reserva) => reserva.id_vuelo))];
            const vuelosData = {};
            await Promise.all(
            vueloIds.map(async (id_vuelo) => {
                const vueloResponse = await fetch(`${apiUrl}/vuelos/${id_vuelo}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (vueloResponse.ok) {
                    const vueloData = await vueloResponse.json();
                    vuelosData[id_vuelo] = vueloData;
                }
            })
            );
            setVuelos(vuelosData);

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
    }, []);

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

    // Get flight details for display
    const getFlightDetails = (id_vuelo) => {
        const vueloData = vuelos[id_vuelo];
        if (!vueloData || !vueloData.vuelo) {
            return 'Vuelo no disponible';
        }
        const { vuelo } = vueloData;
        const origen = getAirportName(vuelo.origen);
        const destino = getAirportName(vuelo.destino);
        const fechaSalida = formatDate(vuelo.fecha_salida);
        return `${origen} → ${destino} (${fechaSalida})`;
    };

    return (
        <div className="flex flex-col min-h-screen">
        <NavbarComponent />
        <div className="p-6 w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Reservas</h1>

            {isLoading ? (
            <p className="text-gray-600">Cargando reservas...</p>
            ) : error ? (
            <p className="text-red-600">Error: {error}</p>
            ) : reservas.length === 0 ? (
            <p className="text-gray-600">No tienes reservas registradas.</p>
            ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código de Reserva
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vuelo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asientos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Reserva
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {reservas.map((reserva) => (
                        <tr key={reserva._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reserva.codigo_reserva}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getFlightDetails(reserva.id_vuelo)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reserva.asientos.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(reserva.fecha_reserva)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reserva.estado}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <NavLink
                            to={`/reserva/${reserva._id}`}
                            className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                            Ver Detalles
                            </NavLink>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4 p-4">
                {reservas.map((reserva) => (
                    <div key={reserva._id} className="bg-white rounded-lg shadow p-4">
                    <div className="grid grid-cols-1 gap-2">
                        <div>
                        <span className="text-sm font-medium text-gray-700">Código de Reserva:</span>
                        <p className="text-sm text-gray-900">{reserva.codigo_reserva}</p>
                        </div>
                        <div>
                        <span className="text-sm font-medium text-gray-700">Vuelo:</span>
                        <p className="text-sm text-gray-900">{getFlightDetails(reserva.id_vuelo)}</p>
                        </div>
                        <div>
                        <span className="text-sm font-medium text-gray-700">Asientos:</span>
                        <p className="text-sm text-gray-900">{reserva.asientos.join(', ')}</p>
                        </div>
                        <div>
                        <span className="text-sm font-medium text-gray-700">Fecha de Reserva:</span>
                        <p className="text-sm text-gray-900">{formatDate(reserva.fecha_reserva)}</p>
                        </div>
                        <div>
                        <span className="text-sm font-medium text-gray-700">Estado:</span>
                        <p className="text-sm text-gray-900">{reserva.estado}</p>
                        </div>
                        <div>
                        <NavLink
                            to={`/reserva/${reserva._id}`}
                            className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 w-full justify-center"
                        >
                            Ver Detalles
                        </NavLink>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
        </div>
    );
};

export default Reservas;