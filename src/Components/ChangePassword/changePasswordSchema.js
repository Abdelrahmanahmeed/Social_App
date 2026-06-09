import { z } from 'zod'

const passwordRules = z
  .string()
  .min(1, 'Password is required')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)',
  )

export const changePasswordSchema = z
  .object({
    password: z.string().min(1, 'Current password is required'),
    newPassword: passwordRules,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }

    if (data.password && data.newPassword && data.password === data.newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password must be different from current password',
        path: ['newPassword'],
      })
    }
  })

export default changePasswordSchema
