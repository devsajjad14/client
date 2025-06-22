import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { FiCheck, FiClock, FiX, FiAlertTriangle } from 'react-icons/fi'
import { ReactNode } from 'react'

type Order = {
  id: string
  customer: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'cancelled' | 'failed'
  payment: string
}

export const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({ row }) => (
      <span className='font-medium text-blue-600 dark:text-blue-400'>
        {row.getValue('id')}
      </span>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString(),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)

      return <div className='font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<Order['status']>('status')
      const variant = {
        completed: 'default',
        pending: 'secondary',
        cancelled: 'destructive',
        failed: 'destructive',
      }[status] as 'default' | 'secondary' | 'destructive'

      const iconMap: Record<Order['status'], ReactNode> = {
        completed: <FiCheck className='mr-1 h-3 w-3' />,
        pending: <FiClock className='mr-1 h-3 w-3' />,
        cancelled: <FiX className='mr-1 h-3 w-3' />,
        failed: <FiAlertTriangle className='mr-1 h-3 w-3' />,
      }

      return (
        <Badge variant={variant} className='capitalize'>
          {iconMap[status]}
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    cell: ({ row }) => {
      const payment = row.getValue<string>('payment')
      return <span className='capitalize'>{payment}</span>
    },
  },
] 