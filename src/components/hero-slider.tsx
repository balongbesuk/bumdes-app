"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface HeroSliderProps {
  images: string[]
}

export function HeroSlider({ images }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Ganti gambar setiap 5 detik

    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) return null

  return (
    <>
      <div className="absolute inset-0 z-0">
        {images.map((img, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <img
              src={img}
              alt={`Hero Background ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
      {/* Overlay gradient untuk memastikan teks tetap terbaca */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/60 via-background/80 to-background dark:from-background/70 dark:via-background/80 dark:to-background pointer-events-none backdrop-blur-[2px]"></div>
    </>
  )
}
