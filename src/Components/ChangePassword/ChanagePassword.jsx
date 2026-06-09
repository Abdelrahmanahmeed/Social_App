import { useContext, useState } from 'react'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { IoKeyOutline } from 'react-icons/io5'
import { AuthContext } from '../../Context/AuthContext.jsx'
import changePasswordSchema from './changePasswordSchema.js'

export default function ChanagePassword() {
  const { token, setToken } = useContext(AuthContext)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values) {
    setSuccessMsg('')
    setErrorMsg('')

    try {
      const { data } = await axios.patch(
        'https://route-posts.routemisr.com/users/change-password',
        {
          password: values.password,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const newToken = data?.data?.token || data?.token
      if (newToken) {
        localStorage.setItem('token', newToken)
        setToken(newToken)
      }

      setSuccessMsg('Password changed successfully.')
      reset()
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message || 'Failed to change password.',
      )
    }
  }

  const inputClass = (hasError) =>
    `w-full rounded-xl border bg-[#F8FAFC] px-3 py-2.5 ps-10 text-sm text-slate-800 outline-none transition ${
      hasError
        ? 'border-red-500 focus:border-red-500'
        : 'border-[#E2E8F0] focus:border-[#00298d]'
    } focus:bg-white`

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#E7F3FF] text-[#1877f2]">
            <IoKeyOutline size={22} />
          </span>

          <div>
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Change Password
            </h1>
            <p className="text-sm text-slate-500">
              Keep your account secure with a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {successMsg && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Current password
            </label>
            <div className="relative">
              <IoKeyOutline
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#90A1B9]"
                size={18}
              />
              <input
                type="password"
                placeholder="Enter current password"
                className={inputClass(errors.password)}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              New password
            </label>
            <div className="relative">
              <IoKeyOutline
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#90A1B9]"
                size={18}
              />
              <input
                type="password"
                placeholder="Enter new password"
                className={inputClass(errors.newPassword)}
                {...register('newPassword')}
              />
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              Confirm new password
            </label>
            <div className="relative">
              <IoKeyOutline
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#90A1B9]"
                size={18}
              />
              <input
                type="password"
                placeholder="Re-enter new password"
                className={inputClass(errors.confirmPassword)}
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#00298d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#002070] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </section>
    </div>
  )
}
