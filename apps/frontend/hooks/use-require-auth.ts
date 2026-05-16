'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function useRequireAuth(requiredRole?: string) {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    if (requiredRole && user?.role !== requiredRole) { router.push('/dashboard') }
  }, [token, user, router, requiredRole])

  return { user, isAuthenticated: !!token }
}
