import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['ADMIN', 'HR_MANAGER', 'EMPLOYEE']).default('ADMIN'),
  companyName: z.string().min(2).max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const employeeSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  walletAddress: z.string().min(10),
  title: z.string().optional(),
  salary: z.number().positive(),
  token: z.enum(['USDC', 'USDT', 'XLM']).default('USDC'),
  paymentFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).default('MONTHLY'),
})

export const payrollSchema = z.object({
  employeeId: z.string(),
  amount: z.number().positive(),
  token: z.enum(['USDC', 'USDT', 'XLM']),
  paymentDate: z.string().datetime(),
})

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return { error: result.error.errors.map(e => e.message).join(', ') }
  }
  return { data: result.data }
}
