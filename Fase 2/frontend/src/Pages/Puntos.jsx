import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NavbarComponent from '../components/navbarComponent';
import { getUserInfo } from '../utils/auth';
const apiUrl = import.meta.env.VITE_API_URL;

const Puntos = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data
  useEffect(() => {
    const userInfo = getUserInfo();
    if (!userInfo || userInfo.tipo !== 'pasajero') {
      setError('Acceso denegado: Solo los pasajeros pueden ver sus puntos');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const userResponse = await fetch(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) {
          throw new Error(`Error HTTP: ${userResponse.status} ${userResponse.statusText}`);
        }
        const userData = await userResponse.json();
        setUserData(userData);
      } catch (error) {
        console.error('Error al obtener datos:', error);
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
          <p className="text-[#333446]">Cargando puntos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEFEF]">
      <NavbarComponent />
      <div className="flex flex-col items-center p-6">
        <div className="w-full max-w-6xl mb-8">
          <h1 className="text-3xl font-bold text-[#333446] mb-2">Tus Puntos</h1>
          <p className="text-[#7F8CAA]">Consulta los puntos acumulados por tus vuelos</p>
        </div>

        {error ? (
          <p className="text-red-600 text-center">Error: {error}</p>
        ) : !userData || userData.tipo !== 'pasajero' ? (
          <p className="text-red-600 text-center">Acceso denegado: Solo los pasajeros pueden ver sus puntos</p>
        ) : (
          <div className="w-full max-w-6xl">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-[#333446] mb-2">Total de Puntos</h2>
              <p className="text-4xl font-semibold text-[#7F8CAA]">
                {userData.puntos || 0}
              </p>
              {userData.puntos === 0 && (
                <p className="text-sm text-[#7F8CAA] mt-2">
                  No tienes puntos acumulados.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Puntos;