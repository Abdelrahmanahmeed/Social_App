import { createContext, useState } from 'react'


export const AuthContext = createContext()


export default function AuthContextProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [userData, setUserData] = useState(() => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  })

  return (
    <AuthContext.Provider value={{ token, setToken, userData, setUserData, isAuthenticated: !!token   }}>
      {children}
    </AuthContext.Provider>
  )
}
