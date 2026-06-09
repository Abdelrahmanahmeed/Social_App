import { Link } from 'react-router-dom'
import routeLogo from '../../assets/Images/route.png'

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="mx-auto grid min-h-screen lg:max-w-6xl lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1877f2] lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-[#47bfff]/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <img
                src={routeLogo}
                alt="Route Posts"
                className="h-14 w-14 rounded-2xl object-cover shadow-lg ring-2 ring-white/20"
              />
              <div>
                <p className="text-2xl font-black text-white">Route Posts</p>
                <p className="text-sm font-semibold text-blue-100">Connect. Share. Grow.</p>
              </div>
            </div>

            <h2 className="mt-10 max-w-sm text-3xl font-black leading-tight text-white">
              Your community is waiting for you.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-blue-100/90">
              Share moments, follow friends, and stay updated with everything that matters on
              Route Posts.
            </p>

            <ul className="mt-8 space-y-3 text-sm font-semibold text-white/90">
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                Post photos and updates instantly
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                Like, comment, and share with friends
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                Get notified about activity on your posts
              </li>
            </ul>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
              <img
                src={routeLogo}
                alt="Route Posts"
                className="h-12 w-12 rounded-xl object-cover shadow-sm"
              />
              <p className="text-xl font-extrabold text-slate-900">Route Posts</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                )}
              </div>

              {children}

              {footerText && footerLinkText && footerLinkTo && (
                <p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
                  {footerText}{' '}
                  <Link
                    to={footerLinkTo}
                    className="font-bold text-[#1877f2] transition hover:text-[#166fe5] hover:underline"
                  >
                    {footerLinkText}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
