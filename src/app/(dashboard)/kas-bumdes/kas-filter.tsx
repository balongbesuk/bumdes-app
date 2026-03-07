"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function KasFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentMonth = searchParams.get('bulan') ?? "all"
  const currentYear = searchParams.get('tahun') ?? new Date().getFullYear().toString()
  const currentType = searchParams.get('tipe') ?? "all"

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
        params.set(name, value)
    } else {
        params.delete(name)
    }
    return params.toString()
  }

  const handleFilterChange = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value))
  }

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ]

  const types = [
    { value: "all", label: "Semua Tipe" },
    { value: "PEMASUKAN", label: "Pemasukan Langsung" },
    { value: "PENGELUARAN", label: "Pengeluaran Utama" },
    { value: "SETORAN_UNIT", label: "Setoran dari Unit" },
  ]

  const years = []
  const currentY = new Date().getFullYear()
  for (let i = currentY - 2; i <= currentY + 1; i++) {
     years.push(i.toString())
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6 items-center">
      <Select value={currentMonth} onValueChange={(v) => handleFilterChange('bulan', v ?? "all")}>
        <SelectTrigger id="filter-bulan" className="w-[140px]">
          <SelectValue placeholder="Semua Bulan">
            {currentMonth === "all" ? "Semua Bulan" : months.find(m => m.value === currentMonth)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {months.map(m => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentYear} onValueChange={(v) => handleFilterChange('tahun', v ?? new Date().getFullYear().toString())}>
        <SelectTrigger id="filter-tahun" className="w-[110px]">
          <SelectValue placeholder="Tahun">
            {currentYear}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
             <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentType} onValueChange={(v) => handleFilterChange('tipe', v ?? "all")}>
        <SelectTrigger id="filter-tipe" className="w-[165px]">
          <SelectValue placeholder="Semua Tipe">
            {types.find(t => t.value === currentType)?.label || "Semua Tipe"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {types.map(t => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
