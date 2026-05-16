'use client'

import { Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { WalletButton } from '@/components/wallet/wallet-button'
import { useAuthStore } from '@/store/auth'

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore()

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between shrink-0">
      <div>
        <p className="text-sm text-muted-foreground">
          {user?.company?.name ?? 'Your Company'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <WalletButton />
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
