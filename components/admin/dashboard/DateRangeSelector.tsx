'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FiCalendar, FiChevronDown } from 'react-icons/fi'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

export function DateRangeSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const timeRange = searchParams.get('timeRange') || '30d'
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('timeRange', 'custom')
      params.set('startDate', format(range.from, 'yyyy-MM-dd'))
      params.set('endDate', format(range.to, 'yyyy-MM-dd'))
      router.push(`?${params.toString()}`)
    }
  }

  const handleTimeRangeSelect = (range: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('timeRange', range)
    params.delete('startDate')
    params.delete('endDate')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleTimeRangeSelect('7d')}
        className={timeRange === '7d' ? 'bg-primary text-primary-foreground' : ''}
      >
        <FiCalendar className="mr-2 h-4 w-4" />
        7 Days
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleTimeRangeSelect('30d')}
        className={timeRange === '30d' ? 'bg-primary text-primary-foreground' : ''}
      >
        <FiCalendar className="mr-2 h-4 w-4" />
        30 Days
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleTimeRangeSelect('90d')}
        className={timeRange === '90d' ? 'bg-primary text-primary-foreground' : ''}
      >
        <FiCalendar className="mr-2 h-4 w-4" />
        90 Days
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange?.from && "text-muted-foreground",
              timeRange === 'custom' && "bg-primary text-primary-foreground"
            )}
          >
            <FiCalendar className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Custom Range</span>
            )}
            <FiChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 