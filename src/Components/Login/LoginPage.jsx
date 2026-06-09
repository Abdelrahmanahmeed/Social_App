import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useContext, useState } from 'react'
import { CiAt } from 'react-icons/ci'
import { IoKeyOutline } from 'react-icons/io5'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext.jsx'
import AuthLayout from '../Auth/AuthLayout.jsx'
import { authAlertClass, authInputClass, authLabelClass, authSubmitClass } from '../Auth/authStyles.js'
import loginSchema from './loginSchema'

export default function Login() {
  const navigate = useNavigate()
  const { setToken, setUserData } = useContext(AuthContext)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values) {
    setErrorMessage('')

    try {
      const { data } = await axios.post('https://route-posts.routemisr.com/users/signin', values)

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      setToken(data.data.token)
      setUserData(data.data.user)
      navigate('/')
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Invalid email or password',
      )
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your social journey."
      footerText="Don't have an account?"
      footerLinkText="Create new account"
      footerLinkTo="/register"
    >
      {errorMessage && (
        <div className={`mb-4 ${authAlertClass('error')}`}>{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className={authLabelClass()}>
            Email
          </label>
          <div className="relative">
            <CiAt
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              strokeWidth={0.8}
              size={18}
            />
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              className={authInputClass(errors.email)}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className={authLabelClass()}>
            Password
          </label>
          <div className="relative">
            <IoKeyOutline
              strokeWidth={0.8}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              className={authInputClass(errors.password)}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className={authSubmitClass()}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}
