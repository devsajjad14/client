'use client'

import { Line } from 'react-chartjs-2'
import { FiMoreVertical } from 'react-icons/fi'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
  TooltipItem,
  Scale,
  CoreScaleOptions,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function AnalyticsCharts() {
  const data: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue',
        data: [6500, 5900, 8000, 8100, 5600, 5500, 4000],
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Customers',
        data: [320, 450, 400, 510, 360, 300, 260],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        yAxisID: 'y1',
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            let label = context.dataset.label || ''
            if (label) label += ': '
            if (context.parsed.y !== null) {
              label += `$${context.parsed.y.toLocaleString()}`
            }
            return label
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
            if (typeof tickValue === 'number') {
              return `$${tickValue.toLocaleString()}`
            }
            return tickValue
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 h-full'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Performance Analytics
        </h3>
        <button className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'>
          <FiMoreVertical />
        </button>
      </div>
      <div className='h-[300px]'>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
