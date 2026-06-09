export function authInputClass(hasError) {
  return `w-full rounded-xl border bg-[#F8FAFC] py-3 ps-10 pe-4 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-200 focus:border-[#1877f2] focus:ring-[#1877f2]/20'
  }`
}

export function authLabelClass() {
  return 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500'
}

export function authSubmitClass() {
  return 'mt-2 w-full rounded-xl bg-[#1877f2] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60'
}

export function authAlertClass(type = 'error') {
  return `rounded-xl px-4 py-3 text-sm font-medium ${
    type === 'success'
      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border border-red-200 bg-red-50 text-red-600'
  }`
}
