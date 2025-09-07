import './App.css'
import Login from './Pages/login'
import Register from './Pages/register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProfileUser from './Pages/profileUser'
import MainPage from './Pages/mainPage'
import { ToastContainer } from 'react-toastify'

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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
