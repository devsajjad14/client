'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

type TableStatus = 'pending' | 'completed' | 'error' | 'skipped'

interface TableInfo {
  name: string
  status: TableStatus
  message?: string
}

export default function DeleteSeedData() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [tableStatuses, setTableStatuses] = useState<TableInfo[]>([
    { name: 'Reviews', status: 'pending' },
    { name: 'Order Items', status: 'pending' },
    { name: 'Orders', status: 'pending' },
    { name: 'Product Alternate Images', status: 'pending' },
    { name: 'Product Variations', status: 'pending' },
    { name: 'Attribute Values', status: 'pending' },
    { name: 'Attributes', status: 'pending' },
    { name: 'Products', status: 'pending' },
    { name: 'Addresses', status: 'pending' },
    { name: 'User Profiles', status: 'pending' },
    { name: 'API Integration', status: 'pending' },
    { name: 'Settings', status: 'pending' },
    { name: 'Data Mode Settings', status: 'pending' },
    { name: 'Coupons', status: 'pending' },
    { name: 'Taxonomy', status: 'pending' },
    { name: 'Brands', status: 'pending' },
    { name: 'Users', status: 'pending' }
  ])
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    setProgress(0)
    setTableStatuses(prev => prev.map(table => ({ ...table, status: 'pending' })))

    try {
      const response = await fetch('/api/admin/seed/delete', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete data')
      }

      // Update table statuses based on results
      if (data.results) {
        const newStatuses = tableStatuses.map(table => {
          const result = data.results[table.name.toLowerCase().replace(/\s+/g, '_')]
          if (result) {
            let status: TableStatus = 'pending'
            if (result.status === 'completed') status = 'completed'
            else if (result.status === 'skipped') status = 'skipped'
            else if (result.status === 'error') status = 'error'
            
            return {
              name: table.name,
              status,
              message: result.message
            }
          }
          return table
        })
        setTableStatuses(newStatuses)
        setProgress(100)
      }

      toast({
        title: 'Success',
        description: 'Data deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting data:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: TableStatus) => {
    if (!isLoading) {
      return null; // Don't show any icon when not loading
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
    }
  }

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'skipped':
        return 'text-yellow-500'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          Delete Seed Data
        </h1>
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Warning</Label>
            <p className="text-sm text-red-500">
              This action will delete all data from the following tables in order:
            </p>
            <div className="space-y-2">
              {tableStatuses.map((table, index) => (
                <div 
                  key={table.name}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{table.name}</span>
                      {getStatusIcon(table.status)}
                    </div>
                    {table.message && (
                      <p className={`text-sm mt-1 ${getStatusColor(table.status)}`}>
                        {table.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-sm text-red-500 mt-2">
              Note: Tables are deleted in this specific order to maintain database integrity and respect foreign key relationships.
            </p>
          </div>
          <Button 
            onClick={handleDelete} 
            variant="destructive"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete All Data'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
} 