import { useContext, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext.jsx'
import { Avatar } from '@heroui/react'
import { LuHouse, LuMenu, LuMessageCircle, LuSettings, LuUser } from 'react-icons/lu'
import route from '../../assets/Images/route.png'

export default function MyNavbar() {
  const navigate = useNavigate()
  const { userData, setToken, setUserData } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  function closeMenu() {
    setMenuClosing(true)
    setTimeout(() => {
      setMenuOpen(false)
      setMenuClosing(false)
    }, 150)
  }

  function handleLogout() {
    closeMenu()
    setIsLoggingOut(true)

    setTimeout(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUserData(null)
      navigate('/login')
    }, 500)
  }

  function handleProfile() {
    closeMenu()
    navigate('/profile')
  }

  function handleSettings() {
    closeMenu()
    navigate('/change-password')
  }

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-extrabold transition sm:gap-2 sm:px-3.5 ${
      isActive
        ? 'bg-white text-[#1f6fe5]'
        : 'text-slate-600 hover:bg-white/90 hover:text-slate-900'
    }`

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm animate-logout-overlay">
          <div className="flex flex-col items-center gap-3 animate-logout-content">
            <div className="h-10 w-10 rounded-full border-4 border-[#00298d] border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-[#00298d]">Logging out...</p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-2 py-1.5 sm:gap-3 sm:px-3">
          <div className="m-0 grow-0">
            <div className="flex items-center gap-3">
              <img
                src={route}
                alt="Route Posts"
                className="h-9 w-9 rounded-xl object-cover"
              />
              <p className="hidden text-xl font-extrabold text-slate-900 sm:block">
                Route Posts
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-8 justify-center">
            <nav className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/90 px-1 py-1 sm:px-1.5">
              <NavLink to="/" className={navLinkClass}>
                <LuHouse size={20} />
                <span className="hidden sm:inline">Feed</span>
                <span className="sr-only sm:hidden">Feed</span>
              </NavLink>

              <NavLink to="/profile" className={navLinkClass}>
                <LuUser size={20} />
                <span className="hidden sm:inline">Profile</span>
                <span className="sr-only sm:hidden">Profile</span>
              </NavLink>

              <NavLink to="/notification" className={navLinkClass}>
                <LuMessageCircle size={20} />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sr-only sm:hidden">Notifications</span>
              </NavLink>
            </nav>
          </div>

          <div className="relative m-0 grow-0">
            <button
              type="button"
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 transition hover:bg-slate-100"
            >
              <Avatar size="sm" className="h-8 w-8">
                <Avatar.Image
                  src={
                    userData?.photo ||
                    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'
                  }
                />
                <Avatar.Fallback>{userData?.name?.[0]}</Avatar.Fallback>
              </Avatar>
              <span className="hidden truncate text-sm font-semibold text-slate-800 md:block">
                {userData?.name}
              </span>
              <LuMenu size={15} className="text-slate-500" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-10"
                  onClick={closeMenu}
                />
                <div
                  className={`absolute right-0 z-20 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl ${
                    menuClosing ? 'animate-dropdown-out' : 'animate-dropdown-in'
                  }`}
                >
                  <button
                    type="button"
                    onClick={handleProfile}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <LuUser size={18} />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleSettings}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <LuSettings size={18} />
                    Settings
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
