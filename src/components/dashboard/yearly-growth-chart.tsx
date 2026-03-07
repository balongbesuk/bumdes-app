"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts"

interface YearlyGrowthChartProps {
  data: {
    year: string
    pemasukan: number
    pengeluaran: number
  }[]
}

export function YearlyGrowthChart({ data }: YearlyGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
        <XAxis
          dataKey="year"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground font-inter"
          padding={{ left: 10, right: 10 }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp${(value / 1000000).toLocaleString()}Jt`}
          className="fill-muted-foreground font-inter"
        />
        <Tooltip
          contentStyle={{ 
            borderRadius: '10px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            backgroundColor: 'currentColor'
          }}
          itemStyle={{ color: 'var(--tooltip-foreground)' }}
          labelStyle={{ fontWeight: 'bold', color: 'var(--tooltip-foreground)', marginBottom: '8px' }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-md">
                  <p className="font-semibold text-foreground mb-2">{label}</p>
                  {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                         <span className="text-sm font-medium text-muted-foreground">
                           {entry.name === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                         </span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: entry.name === 'Pemasukan' ? '#22c55e' : '#ef4444' }}>
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0
                        }).format(entry.value as number)}
                      </span>
                    </div>
                  ))}
                  {/* Kalkulasi Laba */}
                  <div className="mt-2 pt-2 border-t flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Laba Bersih</span>
                    <span className="text-sm font-bold text-foreground">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0
                      }).format(Number(payload[0].value) - Number(payload[1].value))}
                    </span>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" />
        <Area
          type="monotone"
          dataKey="pemasukan"
          name="Pemasukan"
          stroke="#22c55e"
          strokeWidth={3}
          fill="#22c55e"
          fillOpacity={0.2}
        />
        <Area
          type="monotone"
          dataKey="pengeluaran"
          name="Pengeluaran"
          stroke="#ef4444"
          strokeWidth={3}
          fill="#ef4444"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
