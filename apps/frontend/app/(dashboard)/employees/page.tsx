'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, MoreHorizontal, UserCheck, UserX, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, shortenAddress } from '@/lib/utils'
import type { Employee } from '@/types'
import { AddEmployeeDialog } from '@/components/employees/add-employee-dialog'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  TERMINATED: 'destructive',
}

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const queryClient = useQueryClient()

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['employees', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`/employees?${params}`)
      return res.data.data
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/employees/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground">{employees.length} total employees</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search employees..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['', 'ACTIVE', 'SUSPENDED'].map((s) => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>
              {s || 'All'}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    No employees found. Add your first employee to get started.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                        {emp.title && <p className="text-xs text-muted-foreground">{emp.title}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{shortenAddress(emp.walletAddress)}</TableCell>
                    <TableCell>{formatCurrency(emp.salary, emp.token)}</TableCell>
                    <TableCell className="capitalize">{emp.paymentFrequency.toLowerCase()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[emp.status]}>{emp.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {emp.status === 'ACTIVE' ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => statusMutation.mutate({ id: emp.id, status: 'SUSPENDED' })}>
                            <UserX className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => statusMutation.mutate({ id: emp.id, status: 'ACTIVE' })}>
                            <UserCheck className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(emp.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddEmployeeDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
