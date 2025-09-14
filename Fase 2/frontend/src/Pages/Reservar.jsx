import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import NavbarComponent from '../components/navbarComponent';
const apiUrl = import.meta.env.VITE_API_URL;

const Reservar = () => {
    const [searchParams] = useSearchParams();
    const id_vuelo = searchParams.get('id_vuelo');
    const [vuelo, setVuelo] = useState(null);
    const [avion, setAvion] = useState(null);
    const [aeropuertos, setAeropuertos] = useState([]);
    const [reservedSeats, setReservedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch flight, airports, and reserved seats
    useEffect(() => {
        const fetchData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }
            if (!id_vuelo) {
                throw new Error('ID de vuelo no proporcionado');
            }

            // Fetch flight details
            const vueloResponse = await fetch(`${apiUrl}/vuelos/${id_vuelo}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!vueloResponse.ok) {
                throw new Error(`Error HTTP: ${vueloResponse.status} ${vueloResponse.statusText}`);
            }
            const vueloData = await vueloResponse.json();
            setVuelo(vueloData.vuelo);
            setAvion(vueloData.avion);

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

            // Fetch reserved seats
            const reservedSeatsResponse = await fetch(`${apiUrl}/reservas/asientos-reservados/${id_vuelo}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!reservedSeatsResponse.ok) {
                throw new Error(`Error HTTP: ${reservedSeatsResponse.status} ${reservedSeatsResponse.statusText}`);
            }
            const reservedSeatsData = await reservedSeatsResponse.json();
            if (Array.isArray(reservedSeatsData)) {
                setReservedSeats(reservedSeatsData);
            } else {
                throw new Error('Datos de asientos reservados en formato incorrecto');
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
        };

        fetchData();
    }, [id_vuelo]);

    // Handle seat selection
    const handleSeatClick = (seatNumber) => {
        if (reservedSeats.includes(seatNumber)) {
            toast.error('Este asiento ya está reservado');
            return;
        }
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    // Submit reservation
    const handleReservationSubmit = async (e) => {
        e.preventDefault();
        if (selectedSeats.length === 0) {
            toast.error('Por favor selecciona al menos un asiento');
            return;
        }
        try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }

        const payload = {
            id_vuelo,
            asientos_reservados: selectedSeats.length,
            asientos: selectedSeats,
        };

        console.log('Payload de reserva:', payload);

        const response = await fetch(`${apiUrl}/reservas`, {
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

        toast.success('Reserva realizada exitosamente');
        setSelectedSeats([]);
        // Refresh reserved seats
        const reservedSeatsResponse = await fetch(`${apiUrl}/reservas/asientos-reservados/${id_vuelo}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        const reservedSeatsData = await reservedSeatsResponse.json();
        if (Array.isArray(reservedSeatsData)) {
            setReservedSeats(reservedSeatsData);
        }
        } catch (error) {
            console.error('Error al realizar la reserva:', error);
            toast.error(`Error al realizar la reserva: ${error.message}`);
        }
    };

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

    // Generate seat map
    const renderSeatMap = () => {
        if (!avion) return null;
        const seatsPerRow = 6; // A-B-C | D-E-F layout
        const totalSeats = avion.capacidadMaxima;
        const rows = Math.ceil(totalSeats / seatsPerRow);
        const seatMap = [];

        for (let row = 0; row < rows; row++) {
        const rowSeats = [];
        for (let col = 0; col < seatsPerRow; col++) {
            const seatNumber = row * seatsPerRow + col + 1;
            if (seatNumber > totalSeats) break;
            const isReserved = reservedSeats.includes(seatNumber);
            const isSelected = selectedSeats.includes(seatNumber);
            rowSeats.push(
            <button
                key={seatNumber}
                onClick={() => handleSeatClick(seatNumber)}
                className={`w-10 h-10 m-1 rounded-lg text-sm font-medium transition duration-200 ${
                isReserved
                    ? 'bg-red-500 text-white cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                disabled={isReserved}
            >
                {seatNumber}
            </button>
            );
        }
        seatMap.push(
            <div key={row} className="flex justify-center space-x-2">
            {rowSeats.slice(0, 3)}
            <div className="w-8"></div> {/* Aisle */}
            {rowSeats.slice(3)}
            </div>
        );
        }
        return seatMap;
    };

    return (
        <div className="flex flex-col min-h-screen">
        <NavbarComponent />
        <div className="p-6 w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reservar Vuelo</h1>

            {isLoading ? (
            <p className="text-gray-600">Cargando datos del vuelo...</p>
            ) : error ? (
            <p className="text-red-600">Error: {error}</p>
            ) : !vuelo || !avion ? (
            <p className="text-red-600">No se encontraron datos del vuelo o avión</p>
            ) : (
            <>
                {/* Flight Details */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Detalles del Vuelo</h2>
                {vuelo.estado === 'Cancelado' && (
                    <p className="text-red-600 mb-4 font-semibold">Advertencia: Este vuelo está cancelado</p>
                )}
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
                    <label className="block text-sm font-medium text-gray-700">Capacidad Máxima</label>
                    <p className="mt-1 text-sm text-gray-900">{avion.capacidadMaxima} asientos</p>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <p className="mt-1 text-sm text-gray-900">{vuelo.estado}</p>
                    </div>
                </div>
                </div>

                {/* Seat Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Seleccionar Asientos</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Asientos seleccionados: {selectedSeats.length} de {avion.capacidadMaxima - reservedSeats.length} disponibles
                </p>
                <div className="flex flex-col items-center">{renderSeatMap()}</div>
                <div className="mt-6 flex justify-end">
                    <button
                    onClick={handleReservationSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={vuelo.estado === 'Cancelado' || selectedSeats.length === 0}
                    >
                    Reservar
                    </button>
                </div>
                </div>
            </>
            )}
        </div>
        </div>
    );
};

export default Reservar;