"use client"

import { useState } from "react"
import { ProfitChart } from "./profit-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfitChartContainerProps {
  allTimeData: {
    name: string
    laba: number
  }[]
  currentYearData: {
    name: string
    laba: number
  }[]
}

export function ProfitChartContainer({ allTimeData, currentYearData }: ProfitChartContainerProps) {
  const [view, setView] = useState<"currentYear" | "allTime">("currentYear")

  return (
    <div className="space-y-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle>Laba Bersih Per Unit Usaha {view === "currentYear" ? "(Tahun Ini)" : "(Kumulatif)"}</CardTitle>
          <CardDescription>
            {view === "currentYear" 
              ? "Performa laba unit usaha khusus untuk tahun kalender berjalan." 
              : "Perbandingan performa laba murni unit sejak awal operasional."}
          </CardDescription>
        </div>
        <Select value={view} onValueChange={(v: any) => setView(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Tampilan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="currentYear">Tahun Ini</SelectItem>
            <SelectItem value="allTime">Seluruh Waktu</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <div className="min-w-[400px]">
        <ProfitChart data={view === "currentYear" ? currentYearData : allTimeData} />
      </div>
    </div>
  )
}
