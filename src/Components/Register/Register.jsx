import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useContext, useState } from 'react'
import { CiAt, CiCalendar } from 'react-icons/ci'
import { IoKeyOutline } from 'react-icons/io5'
import { LuUsers } from 'react-icons/lu'
import { RiUser3Line } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthContext } from '../../Context/AuthContext.jsx'
import AuthLayout from '../Auth/AuthLayout.jsx'
import { authAlertClass, authInputClass, authLabelClass, authSubmitClass } from '../Auth/authStyles.js'
import registerSchema from './registerSchema'

export default function Register() {
  const navigate = useNavigate()
  const { setToken, setUserData } = useContext(AuthContext)
  const [successResp, setSuccessResp] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false)

  const maxBirthDate = new Date()
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18)
  const maxBirthDateValue = maxBirthDate.toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values) {
    setErrorMessage('')
    setEmailAlreadyExists(false)

    const { confirmPassword, ...rest } = values
    const payload = {
      ...rest,
      rePassword: confirmPassword,
    }

    try {
      const { data } = await axios.post(
        'https://route-posts.routemisr.com/users/signup',
        payload,
      )

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      setToken(data.data.token)
      setUserData(data.data.user)
      setSuccessResp(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong'

      if (error.response?.status === 409) {
        if (message.toLowerCase().includes('username')) {
          setError('username', { message: 'This username is already taken.' })
        } else {
          setEmailAlreadyExists(true)
          setError('email', { message: 'This email is already registered.' })
        }
        return
      }

      setErrorMessage(message)
    }
  }

  function renderField({
    id,
    label,
    icon: Icon,
    error,
    children,
  }) {
    return (
      <div>
        <label htmlFor={id} className={authLabelClass()}>
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              strokeWidth={0.8}
              size={18}
            />
          )}
          {children}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
      </div>
    )
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Route Posts — it only takes a minute."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    >
      {successResp && (
        <div className={`mb-4 ${authAlertClass('success')}`}>
          Account created successfully! Redirecting...
        </div>
      )}

      {errorMessage && (
        <div className={`mb-4 ${authAlertClass('error')}`}>{errorMessage}</div>
      )}

      {emailAlreadyExists && (
        <p className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#1877f2] hover:underline">
            Sign in
          </Link>
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {renderField({
            id: 'register-name',
            label: 'Full name',
            icon: RiUser3Line,
            error: errors.name,
            children: (
              <input
                id="register-name"
                type="text"
                placeholder="Your full name"
                className={authInputClass(errors.name)}
                {...register('name')}
              />
            ),
          })}

          {renderField({
            id: 'register-username',
            label: 'Username',
            icon: CiAt,
            error: errors.username,
            children: (
              <input
                id="register-username"
                type="text"
                placeholder="Optional"
                className={authInputClass(errors.username)}
                {...register('username')}
              />
            ),
          })}
        </div>

        {renderField({
          id: 'register-email',
          label: 'Email',
          icon: CiAt,
          error: errors.email,
          children: (
            <input
              id="register-email"
              type="email"
              placeholder="name@example.com"
              className={authInputClass(errors.email)}
              {...register('email')}
            />
          ),
        })}

        <div className="grid gap-4 sm:grid-cols-2">
          {renderField({
            id: 'register-gender',
            label: 'Gender',
            icon: LuUsers,
            error: errors.gender,
            children: (
              <select
                id="register-gender"
                className={`${authInputClass(errors.gender)} appearance-none`}
                defaultValue=""
                {...register('gender')}
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            ),
          })}

          {renderField({
            id: 'register-dob',
            label: 'Date of birth',
            icon: CiCalendar,
            error: errors.dateOfBirth,
            children: (
              <input
                id="register-dob"
                type="date"
                max={maxBirthDateValue}
                className={authInputClass(errors.dateOfBirth)}
                {...register('dateOfBirth')}
              />
            ),
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {renderField({
            id: 'register-password',
            label: 'Password',
            icon: IoKeyOutline,
            error: errors.password,
            children: (
              <input
                id="register-password"
                type="password"
                placeholder="Create password"
                className={authInputClass(errors.password)}
                {...register('password', {
                  onChange: () => {
                    void trigger('confirmPassword')
                  },
                })}
              />
            ),
          })}

          {renderField({
            id: 'register-confirm-password',
            label: 'Confirm password',
            icon: IoKeyOutline,
            error: errors.confirmPassword,
            children: (
              <input
                id="register-confirm-password"
                type="password"
                placeholder="Repeat password"
                className={authInputClass(errors.confirmPassword)}
                {...register('confirmPassword')}
              />
            ),
          })}
        </div>

        <button type="submit" disabled={isSubmitting} className={authSubmitClass()}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
