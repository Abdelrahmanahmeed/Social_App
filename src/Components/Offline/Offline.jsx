import { useState } from 'react'
import { LuRefreshCw, LuWifiOff } from 'react-icons/lu'
import routeLogo from '../../assets/Images/route.png'

export default function Offline() {
  const [isChecking, setIsChecking] = useState(false)

  function handleRetry() {
    setIsChecking(true)

    if (navigator.onLine) {
      const lastPath = sessionStorage.getItem('lastPath') || '/'
      sessionStorage.removeItem('lastPath')
      window.location.href = lastPath
      return
    }

    setTimeout(() => setIsChecking(false), 800)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <img src={routeLogo} alt="Route Posts" className="h-14 w-14 rounded-xl object-cover" />
        </div>

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2]">
          <LuWifiOff size={32} className="text-[#DC2626]" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900">You are offline</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          It looks like your internet connection was lost. Check your network and try again.
        </p>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isChecking}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1877f2] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:opacity-70"
        >
          <LuRefreshCw size={18} className={isChecking ? 'animate-spin' : ''} />
          {isChecking ? 'Checking connection...' : 'Try again'}
        </button>

        <p className="mt-4 text-xs text-slate-400">
          We will bring you back automatically when you are online again.
        </p>
      </div>
    </div>
  )
}
