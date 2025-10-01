import { Navigate } from 'react-router-dom'
import { getRolUser, isAuthenticated } from '../utils/auth'

const ProtectedRoute = ({ allowedRole, layout: Layout, children }) => {
    if(!isAuthenticated()) return <Navigate to="/login" replace />

    const rol = getRolUser()

    if(!allowedRole.includes(rol)) {
        if(rol === 'operaciones') return <Navigate to="/dashboard-admin" replace />
        if(rol === 'piloto') return <Navigate to="/pilotos" replace />
        return <Navigate to="/mainpage" replace />
    }

    return Layout ? <Layout>{children}</Layout> : children
}

export default ProtectedRoute