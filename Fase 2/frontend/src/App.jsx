import './App.css'
import Login from './Pages/login'
import Register from './Pages/register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProfileUser from './Pages/profileUser'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfileUser />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
