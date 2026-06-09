import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthContextProvider from './Context/AuthContext.jsx'
import Login from './Components/Login/LoginPage.jsx'
import Register from './Components/Register/Register.jsx'
import ProtectedRouts from './Components/ProtectedRouts/ProtectedRouts.jsx'
import Home from './Components/Home/Home.jsx'
import Profile from './Components/Profile/Profile.jsx'
import ChangePassword from './Components/ChangePassword/ChanagePassword.jsx'
import Notification from './Components/Notification/Notification.jsx'
import PostDetails from './Components/PostDetails/PostDetails.jsx'
import Offline from './Components/Offline/Offline.jsx'
import OfflineGuard from './Components/Offline/OfflineGuard.jsx'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <OfflineGuard />
          <Routes>
            <Route path="/offline" element={<Offline />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRouts />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/notification" element={<Notification />} />
              <Route path="/postdetails/:id" element={<PostDetails />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
