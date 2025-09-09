import './App.css'
import Login from './Pages/login'
import Register from './Pages/register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProfileUser from './Pages/profileUser'
import MainPage from './Pages/mainPage'
import VerifyAccount from './Pages/verifyAccount'
import { ToastContainer } from 'react-toastify'
import Sidebar from './components/Sidebar';
import React, { useState } from 'react';
import VuelosPage from './Pages/VuelosPage';
import AvionesPage from './Pages/AvionesPage';
import UsuariosPage from './Pages/UsuariosPage';

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
          <Route path="/profile" element={<ProfileUser />} />
          <Route path="/mainpage" element={<MainPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route
            path="/vuelos"
            element={
              <AuthenticatedLayout>
                <VuelosPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/aviones"
            element={
              <AuthenticatedLayout>
                <AvionesPage />
              </AuthenticatedLayout>
            }
          />
          <Route
            path="/usuarios"
            element={
              <AuthenticatedLayout>
                <UsuariosPage />
              </AuthenticatedLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;