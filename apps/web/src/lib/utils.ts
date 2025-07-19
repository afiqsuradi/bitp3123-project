import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Court } from '@/types/court.type.ts'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export function isNumber(text: string) {
  return !isNaN(Number(text))
}

export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export const getCourtAvailabilityStatus = (court: Court) => {
  const now = new Date()

  if (court.status.toLowerCase() === 'maintenance') {
    return { status: 'maintenance', text: 'Not Available (Due to Maintenance)' }
  }

  const isCurrentlyOccupied = court.bookings?.some((booking) => {
    const startTime = new Date(booking.startTime)
    const endTime = new Date(booking.endTime)
    return now >= startTime && now < endTime
  })

  if (isCurrentlyOccupied) {
    return { status: 'occupied', text: 'Currently Occupied' }
  }

  return { status: 'available', text: 'Available Now' }
}
