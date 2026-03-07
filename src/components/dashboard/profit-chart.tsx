"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from "recharts"

interface ProfitChartProps {
  data: {
    name: string
    laba: number
  }[]
}

export function ProfitChart({ data }: ProfitChartProps) {
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
          dataKey="laba"
          name="Laba Bersih"
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.laba >= 0 ? '#22c55e' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
