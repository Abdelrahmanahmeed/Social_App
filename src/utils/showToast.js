export function showToast(message, type = 'success') {
  const existing = document.getElementById('action-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'action-toast'
  toast.className = `fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-opacity duration-300 ${
    type === 'error' ? 'bg-red-500' : 'bg-slate-900'
  }`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
