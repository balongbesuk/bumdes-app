"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts"

interface OverviewChartProps {
  data: {
    name: string
    pemasukan: number
    pengeluaran: number
  }[]
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact', style: 'currency', currency: 'IDR' }).format(value)}
        />
        <Tooltip 
           contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '8px' }}
           itemStyle={{ color: 'var(--foreground)' }}
           labelStyle={{ color: 'var(--foreground)' }}
           formatter={(value: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value as number)}
        />
        <Legend />
        <Bar
          dataKey="pemasukan"
          name="Pemasukan"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-green-500"
        />
        <Bar
          dataKey="pengeluaran"
          name="Pengeluaran"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-red-500"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
