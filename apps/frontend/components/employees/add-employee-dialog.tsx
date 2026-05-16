'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface Props { open: boolean; onClose: () => void }

const TOKENS = ['USDC', 'USDT', 'XLM']
const FREQUENCIES = ['WEEKLY', 'BIWEEKLY', 'MONTHLY']

const EMPTY = { name: '', email: '', walletAddress: '', title: '', salary: '', token: 'USDC', paymentFrequency: 'MONTHLY' }

export function AddEmployeeDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/employees', { ...data, salary: parseFloat(data.salary) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast({ title: 'Employee added', description: `${form.name} has been onboarded.`, variant: 'success' })
      onClose()
      setForm(EMPTY)
      setError('')
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to add employee')
    },
  })

  function set(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })) }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <h2 className="text-lg font-semibold">Add Employee</h2>
        {error && <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2">
            <Label>Full Name</Label>
            <Input placeholder="Jane Doe" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label>Email</Label>
            <Input type="email" placeholder="jane@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="space-y-1 col-span-2">
            <Label>Wallet Address</Label>
            <Input placeholder="G... (Stellar) or 0x... (EVM)" value={form.walletAddress} onChange={(e) => set('walletAddress', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Title</Label>
            <Input placeholder="Engineer" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Salary</Label>
            <Input type="number" min="0" placeholder="5000" value={form.salary} onChange={(e) => set('salary', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Token</Label>
            <Select value={form.token} onValueChange={(v) => set('token', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TOKENS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Frequency</Label>
            <Select value={form.paymentFrequency} onValueChange={(v) => set('paymentFrequency', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => { onClose(); setError('') }}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.name || !form.email || !form.walletAddress || !form.salary}
          >
            {mutation.isPending ? 'Adding...' : 'Add Employee'}
          </Button>
        </div>
      </div>
    </div>
  )
}
