"use client"

import { useState } from "react"
import { YearlyGrowthChart } from "./yearly-growth-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GrowthChartContainerProps {
  yearlyData: {
    year: string
    pemasukan: number
    pengeluaran: number
  }[]
  monthlyData: {
    year: string // Using 'year' label as X-axis key since the chart uses 'year' prop
    pemasukan: number
    pengeluaran: number
  }[]
}

export function GrowthChartContainer({ yearlyData, monthlyData }: GrowthChartContainerProps) {
  const [view, setView] = useState<"monthly" | "yearly">("yearly")

  return (
    <div className="space-y-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle>Statistik Pertumbuhan {view === "yearly" ? "5 Tahun" : "1 Tahun"}</CardTitle>
          <CardDescription>
            {view === "yearly" 
              ? "Grafik komparasi pemasukan dan pengeluaran dari tahun ke tahun." 
              : "Grafik rincian pemasukan dan pengeluaran tiap bulan pada tahun ini."}
          </CardDescription>
        </div>
        <Select value={view} onValueChange={(v: any) => setView(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Tampilan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Bulanan (Tahun Ini)</SelectItem>
            <SelectItem value="yearly">Tahunan (5 Tahun)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <div className="min-w-[500px]">
        <YearlyGrowthChart data={view === "yearly" ? yearlyData : monthlyData} />
      </div>
    </div>
  )
}
