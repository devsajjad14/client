'use client'

import * as React from 'react'

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {},
})

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || '')

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider
      value={{
        value: value || selectedValue,
        onValueChange: handleValueChange,
      }}
    >
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
  ...props
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isSelected = selectedValue === value

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background hover:text-foreground'
      } ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
  ...props
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: selectedValue } = React.useContext(TabsContext)
  const isSelected = selectedValue === value

  if (!isSelected) return null

  return (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
} 