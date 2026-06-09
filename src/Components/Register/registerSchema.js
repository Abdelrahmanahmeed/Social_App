import { z } from 'zod'

const MIN_AGE = 18

function getAge(dateString) {
  const birthDate = new Date(dateString)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1
  }

  return age
}

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .min(3, 'Name must be at least 3 characters'),
    username: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    gender: z
      .string()
      .min(1, 'Please select your gender')
      .pipe(z.enum(['male', 'female'])),
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine(
        (value) => getAge(value) >= MIN_AGE,
        `You must be at least ${MIN_AGE} years old to create an account`,
      ),
    password: z
      .string()
      .min(1, 'Password is required')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export default registerSchema
