// Shared TypeScript types across the backend

export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE'

export type PaymentToken = 'USDC' | 'USDT' | 'XLM'

export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'

export type PayrollStatus = 'PENDING' | 'APPROVED' | 'EXECUTED' | 'FAILED' | 'CANCELLED'

export type EmployeeStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'

export type SupportedChain = 'STELLAR' | 'BASE' | 'CELO' | 'ETHEREUM'

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  companyId?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
