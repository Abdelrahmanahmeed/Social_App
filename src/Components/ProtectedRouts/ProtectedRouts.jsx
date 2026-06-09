import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext.jsx'
import MyNavbar from '../Navbar/Navbar.jsx'

export default function ProtectedRouts() {
  const { isAuthenticated } = useContext(AuthContext)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <MyNavbar />
      <Outlet />
    </>
  )
}
