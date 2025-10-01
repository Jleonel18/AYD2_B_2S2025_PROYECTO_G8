import './App.css'
import Login from './Pages/login'
import Register from './Pages/register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProfileUser from './Pages/profileUser'
import MainPage from './Pages/mainPage'
import VerifyAccount from './Pages/verifyAccount'
import ResetPassword from './Pages/ResetPassword'
import { ToastContainer } from 'react-toastify'
import Sidebar from './components/Sidebar';
import React, { useState } from 'react';
import VuelosPage from './Pages/VuelosPage';
import AvionesPage from './Pages/AvionesPage';
import DashboardAdmin from './Pages/DashboardAdmin'
import Tripulacion from './Pages/Tripulacion'
import AeropuertosPage from './Pages/AeropuertosPage'
import Reservas from './Pages/Reservas'
import Historial from './Pages/Historial'
import Puntos from './Pages/Puntos'
import Reservar from './Pages/Reservar'
import Reserva from './Pages/Reserva'
import PilotView from './Pages/Piloto'
import Pasajeros from './Pages/Pasajeros'
import ProtectedRoute from './components/ProtectedRoute'

// Componente de layout para rutas autenticadas
const AuthenticatedLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Por defecto abierto

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`flex-1 p-6 bg-soft-white transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <ProtectedRoute allowedRole={['pasajero']}>
            <ProfileUser />
          </ProtectedRoute>} 
          />
          <Route path="/mainpage" element={<MainPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reserva/:id_reserva" element={
            <ProtectedRoute allowedRole={['pasajero', 'operaciones']}>
              <Reserva />
            </ProtectedRoute>
          } />
          <Route path="/reservar" element={<ProtectedRoute allowedRole={['pasajero']}>
            <Reservar />
          </ProtectedRoute>} />
          <Route path="/reservas" element={<ProtectedRoute allowedRole={['pasajero']}>
            <Reservas />
          </ProtectedRoute>} />
          <Route path="/historial" element={<ProtectedRoute allowedRole={['pasajero']}>
            <Historial />
          </ProtectedRoute>} />
          <Route path="/puntos" element={<ProtectedRoute allowedRole={['pasajero']}>
            <Puntos />
          </ProtectedRoute>} />
          <Route path="/pilotos" element={<ProtectedRoute allowedRole={['piloto']}>
            <PilotView />
          </ProtectedRoute>} />

          <Route path="/dashboard-admin" element={<ProtectedRoute allowedRole={['operaciones']} layout={AuthenticatedLayout}>
            <DashboardAdmin />
          </ProtectedRoute>} /
          >
          <Route
            path="/vuelos"
            element={<ProtectedRoute allowedRole={['operaciones']} layout={AuthenticatedLayout}>
              <VuelosPage />
            </ProtectedRoute>}
          />
          <Route
            path="/aviones"
            element={
              <ProtectedRoute allowedRole={['operaciones']} layout={AuthenticatedLayout}>
                <AvionesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRole={['operaciones']} layout={AuthenticatedLayout}>
                <Pasajeros />
              </ProtectedRoute>
            }
          />
          <Route path="/tripulacion" element={
            <ProtectedRoute allowedRole={['operaciones']} layout={AuthenticatedLayout}>
              <Tripulacion />
            </ProtectedRoute>
          } />
          <Route path="/aeropuertos" element={
            <ProtectedRoute allowedRole={['operaciones']} layout={AuthenticatedLayout}>
              <AeropuertosPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;