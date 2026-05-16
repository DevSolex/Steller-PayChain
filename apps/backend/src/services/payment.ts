import * as StellarSdk from '@stellar/stellar-sdk'
import { server, sorobanServer, networkPassphrase, adminKeypair, TOKEN_CONTRACTS, isValidStellarAddress } from './stellar'
import { prisma } from '../utils/prisma'
import { config } from '../utils/config'

export interface PaymentResult {
  txHash: string
  success: boolean
  error?: string
}

export async function executeStellarPayment(
  recipientAddress: string,
  amount: string,
  token: string
): Promise<PaymentResult> {
  if (!adminKeypair) throw new Error('Admin keypair not configured')
  if (!isValidStellarAddress(recipientAddress)) throw new Error('Invalid Stellar address')

  try {
    const sourceAccount = await server.loadAccount(adminKeypair.publicKey())
    const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })

    if (token === 'XLM') {
      builder.addOperation(
        StellarSdk.Operation.payment({
          destination: recipientAddress,
          asset: StellarSdk.Asset.native(),
          amount,
        })
      )
    } else {
      // For USDC/USDT — use Stellar asset (classic) or Soroban token
      const asset = new StellarSdk.Asset(token, config.stellar.adminSecret ? adminKeypair.publicKey() : '')
      builder.addOperation(
        StellarSdk.Operation.payment({ destination: recipientAddress, asset, amount })
      )
    }

    const tx = builder.setTimeout(30).build()
    tx.sign(adminKeypair)

    const result = await server.submitTransaction(tx)
    return { txHash: result.hash, success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment failed'
    return { txHash: '', success: false, error: message }
  }
}

export async function executePayroll(payrollId: string): Promise<PaymentResult> {
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    include: { employee: true },
  })

  if (!payroll) throw new Error('Payroll not found')
  if (payroll.status === 'EXECUTED') throw new Error('Payroll already executed')
  if (payroll.status === 'CANCELLED') throw new Error('Payroll is cancelled')

  // Mark as processing
  await prisma.payroll.update({ where: { id: payrollId }, data: { status: 'APPROVED' } })

  const result = await executeStellarPayment(
    payroll.employee.walletAddress,
    payroll.amount.toString(),
    payroll.token
  )

  await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      status: result.success ? 'EXECUTED' : 'FAILED',
      txHash: result.txHash || null,
      executedAt: result.success ? new Date() : null,
      retryCount: result.success ? payroll.retryCount : payroll.retryCount + 1,
    },
  })

  return result
}

export async function executeBulkPayroll(companyId: string): Promise<{ succeeded: number; failed: number }> {
  const pendingPayrolls = await prisma.payroll.findMany({
    where: { companyId, status: 'APPROVED' },
    include: { employee: { select: { walletAddress: true, status: true } } },
  })

  let succeeded = 0
  let failed = 0

  for (const payroll of pendingPayrolls) {
    if (payroll.employee.status !== 'ACTIVE') { failed++; continue }
    const result = await executePayroll(payroll.id)
    result.success ? succeeded++ : failed++
  }

  return { succeeded, failed }
}
