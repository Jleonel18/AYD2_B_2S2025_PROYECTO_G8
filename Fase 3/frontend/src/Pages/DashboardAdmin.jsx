import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_API_URL;

const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch statistics
  useEffect(() => {

    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`${apiUrl}/users/estadisticas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        setError(error.message);
        toast.error(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#EAEFEF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F8CAA] mx-auto mb-4"></div>
          <p className="text-[#333446]">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEFEF]">
      <div className="flex flex-col items-center p-6">
        <div className="w-full max-w-6xl mb-8">
          <h1 className="text-3xl font-bold text-[#333446] mb-2">Panel de Administración</h1>
          <p className="text-[#7F8CAA]">Estadísticas del sistema</p>
        </div>

        {error ? (
          <p className="text-red-600 text-center">Error: {error}</p>
        ) : !stats ? (
          <p className="text-[#7F8CAA] text-center">No hay datos disponibles</p>
        ) : (
          <div className="w-full max-w-6xl">
            {/* Usuarios Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#333446] mb-4">Usuarios</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Total Usuarios</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.usuarios.totalUsers}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Total Pilotos</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.usuarios.totalPilots}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M20 22.002v-5.974c0-.95 0-1.424-.158-1.798a2 2 0 0 0-1.046-1.055c-.373-.161-.847-.165-1.796-.173c0 5-5 7-5 7s-5-2-5-7c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.082C4 14.604 4 15.07 4 16.002v6"/><path d="m12 13.5l2-1v2zm0 0l-2-1v2zm3.5-7v-1a3.5 3.5 0 0 0-7 0v1a3.5 3.5 0 1 0 7 0"/></g></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Total Sobrecargos</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.usuarios.totalFlightAttendants}</p>
                </div>
              </div>
            </div>

            {/* Aviones Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#333446] mb-4">Aviones</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Total Aviones</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.aviones.totalAviones}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Horas de Vuelo Promedio</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.aviones.averageFlightHours.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Aviones Fuera de servicio</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.aviones.totalAvionesCriticos}</p>
                </div>
              </div>
            </div>

            {/* Vuelos Section */}
            <div>
              <h2 className="text-2xl font-bold text-[#333446] mb-4">Vuelos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Total Vuelos</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.vuelos.totalVuelos}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Vuelos Completados</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.vuelos.totalVuelosCompletados}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Vuelos Cancelados</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.vuelos.totalVuelosCancelados}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#333446]">Vuelos Planificados</h3>
                  </div>
                  <p className="text-2xl font-semibold text-[#7F8CAA]">{stats.vuelos.totalVuelosPlanificados}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;