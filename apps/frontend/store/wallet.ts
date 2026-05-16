import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WalletState {
  address: string | null
  network: string | null
  isConnecting: boolean
  connectFreighter: () => Promise<void>
  disconnect: () => void
}

// Freighter wallet API (injected by browser extension)
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>
      getPublicKey: () => Promise<string>
      getNetwork: () => Promise<string>
      signTransaction: (xdr: string, opts?: { network?: string }) => Promise<string>
    }
  }
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      network: null,
      isConnecting: false,

      connectFreighter: async () => {
        if (typeof window === 'undefined' || !window.freighter) {
          throw new Error('Freighter wallet not installed. Please install the Freighter browser extension.')
        }
        set({ isConnecting: true })
        try {
          const connected = await window.freighter.isConnected()
          if (!connected) throw new Error('Please unlock your Freighter wallet')
          const [address, network] = await Promise.all([
            window.freighter.getPublicKey(),
            window.freighter.getNetwork(),
          ])
          set({ address, network })
        } finally {
          set({ isConnecting: false })
        }
      },

      disconnect: () => set({ address: null, network: null }),
    }),
    { name: 'paychain-wallet', partialize: (s) => ({ address: s.address, network: s.network }) }
  )
)
