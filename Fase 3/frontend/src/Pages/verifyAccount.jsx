import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_API_URL

const VerifyAccount = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        // Validar longitud mínima, mayúsculas, minúsculas y números
        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {
            toast.error('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número');
            return;
        }

        try {

            const response = await fetch(`${apiUrl}/users/verificar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, nueva_contrasena: password }),
            });

            const data = await response.json();

            console.log(data)
            if (response.ok) {
                toast.success(data.message || 'Cuenta verificada exitosamente');
                navigate('/login');
            } else {
                toast.error(data.error || 'Error al verificar la cuenta. Inténtalo de nuevo.');
            }
        } catch (error) {
            toast.error('Error al verificar la cuenta. Inténtalo de nuevo.');
            console.error('Error verifying account:', error);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-[#EAEFEF]">
        <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-bold text-[#333446] text-center mb-6">Verificar Cuenta</h2>
            <form onSubmit={handleSubmit}>
            <div className="mb-6">
                <label className="block text-[#333446] text-sm font-semibold mb-2">Contraseña</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-[#7F8CAA] rounded mb-4"
                    placeholder="Ingresa tu contraseña"
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-[#333446] text-sm font-semibold mb-2">Confirmar Contraseña</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border border-[#7F8CAA] rounded mb-4"
                    placeholder="Confirma tu contraseña"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-[#7F8CAA] text-white p-3 rounded hover:bg-[#333446] transition duration-300"
                onClick={handleSubmit}
            >
                Verificar Cuenta
            </button>
            </form>
        </div>
        </div>
    );
};

export default VerifyAccount;