import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useOnlineStatus from '../../hooks/useOnlineStatus.js'

export default function OfflineGuard() {
  const isOnline = useOnlineStatus()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOnline && location.pathname !== '/offline') {
      sessionStorage.setItem('lastPath', location.pathname + location.search)
      navigate('/offline', { replace: true })
      return
    }

    if (isOnline && location.pathname === '/offline') {
      const lastPath = sessionStorage.getItem('lastPath') || '/'
      sessionStorage.removeItem('lastPath')
      navigate(lastPath, { replace: true })
    }
  }, [isOnline, location.pathname, location.search, navigate])

  return null
}
