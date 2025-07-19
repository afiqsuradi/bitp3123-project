import type { Court } from '@/types/court.type.ts'

export type Booking = {
  id: number
  userId: number
  courtId: number
  startTime: Date
  endTime: Date
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
}

export type UserBooking = Booking & {
  court: Omit<Court, 'bookings'>
}
