"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  placeholder?: string
}

export function DatePicker({ date, setDate, placeholder = "Pilih tanggal" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: id }) : <span>{placeholder}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[280px]">
        <DialogTitle className="sr-only">Pilih Tanggal</DialogTitle>
        <div className="bg-background border rounded-lg shadow-md p-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d)
              setOpen(false)
            }}
            initialFocus
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
