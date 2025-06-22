'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FiCalendar } from 'react-icons/fi'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

type DateRangeType = 'year' | '7d' | '30d' | '90d' | 'custom'

interface DateRangeSelectorProps {
  onDateRangeChange: (range: DateRange) => void
}

export function DateRangeSelector({ onDateRangeChange }: DateRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<DateRangeType>('year')
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })

  const handleRangeChange = (range: DateRangeType) => {
    setSelectedRange(range)
    if (range !== 'custom') {
      const today = new Date()
      const from = new Date()
      if (range === 'year') {
        from.setFullYear(today.getFullYear(), 0, 1) // January 1st of current year
      } else {
        from.setDate(today.getDate() - (range === '7d' ? 7 : range === '30d' ? 30 : 90))
      }
      const newDateRange = { from, to: today }
      setDate(newDateRange)
      onDateRangeChange(newDateRange)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={selectedRange === 'year' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleRangeChange('year')}
        className={cn(
          'h-8',
          selectedRange === 'year' && 'bg-primary text-primary-foreground'
        )}
      >
        This Year
      </Button>
      <Button
        variant={selectedRange === '7d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleRangeChange('7d')}
        className={cn(
          'h-8',
          selectedRange === '7d' && 'bg-primary text-primary-foreground'
        )}
      >
        7 Days
      </Button>
      <Button
        variant={selectedRange === '30d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleRangeChange('30d')}
        className={cn(
          'h-8',
          selectedRange === '30d' && 'bg-primary text-primary-foreground'
        )}
      >
        30 Days
      </Button>
      <Button
        variant={selectedRange === '90d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleRangeChange('90d')}
        className={cn(
          'h-8',
          selectedRange === '90d' && 'bg-primary text-primary-foreground'
        )}
      >
        90 Days
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={selectedRange === 'custom' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8',
              selectedRange === 'custom' && 'bg-primary text-primary-foreground'
            )}
          >
            <FiCalendar className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Custom Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate)
              if (newDate?.from && newDate?.to) {
                setSelectedRange('custom')
                onDateRangeChange(newDate)
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 