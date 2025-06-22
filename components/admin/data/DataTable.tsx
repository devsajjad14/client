'use client'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import {
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { useState } from 'react'

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  className?: string
}

export function DataTable<TData>({
  data,
  columns,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 6,
  })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: Math.ceil(data.length / pagination.pageSize),
  })

  return (
    <div className={className}>
      <div className='overflow-x-auto'>
        <table className='w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className='bg-gray-50 dark:bg-gray-700/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer'
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className='flex items-center'>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <FiChevronUp className='ml-1' size={14} />,
                        desc: <FiChevronDown className='ml-1' size={14} />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className='hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors'
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className='px-6 py-4 whitespace-nowrap'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700'>
        <div className='flex-1 flex justify-between sm:hidden'>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md disabled:opacity-50'
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md disabled:opacity-50'
          >
            Next
          </button>
        </div>
        <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Showing{' '}
              <span className='font-medium'>
                {table.getRowModel().rows.length}
              </span>{' '}
              of <span className='font-medium'>{data.length}</span> results
            </p>
          </div>
          <div className='flex space-x-2'>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className='p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700'
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className='p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700'
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
