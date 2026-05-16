'use client'

import { Wallet, LogOut, Loader2 } from 'lucide-react'
import { useWalletStore } from '@/store/wallet'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'

export function WalletButton() {
  const { address, network, isConnecting, connectFreighter, disconnect } = useWalletStore()

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="font-mono">{shortenAddress(address)}</span>
          {network && <span className="text-xs opacity-70">({network})</span>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={disconnect}>
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={connectFreighter} disabled={isConnecting}>
      {isConnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}
