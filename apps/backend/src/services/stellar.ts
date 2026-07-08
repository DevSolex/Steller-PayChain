import * as StellarSdk from '@stellar/stellar-sdk'
import { config } from '../utils/config'

const isTestnet = config.stellar.network === 'testnet'

export const server = new StellarSdk.Horizon.Server(config.stellar.horizonUrl)

export const sorobanServer = new StellarSdk.rpc.Server(config.stellar.sorobanRpc)

export const networkPassphrase = isTestnet
  ? StellarSdk.Networks.TESTNET
  : StellarSdk.Networks.PUBLIC

export const adminKeypair = config.stellar.adminSecret
  ? StellarSdk.Keypair.fromSecret(config.stellar.adminSecret)
  : null

// Token contract addresses on Stellar testnet
export const TOKEN_CONTRACTS: Record<string, string> = {
  USDC: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA', // testnet USDC
  USDT: '', // add when available
  XLM: 'native',
}

export async function getAccountBalance(publicKey: string): Promise<Record<string, string>> {
  try {
    const account = await server.loadAccount(publicKey)
    const balances: Record<string, string> = {}
    for (const balance of account.balances) {
      if (balance.asset_type === 'native') {
        balances['XLM'] = balance.balance
      } else if ('asset_code' in balance) {
        balances[balance.asset_code] = balance.balance
      }
    }
    return balances
  } catch {
    return {}
  }
}

export function isValidStellarAddress(address: string): boolean {
  try {
    StellarSdk.Keypair.fromPublicKey(address)
    return true
  } catch {
    return false
  }
}
