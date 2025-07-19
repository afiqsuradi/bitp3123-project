import type { Court } from '@/types/court.type.ts'
import type { Booking } from '@/types/booking.type.ts'
import { apiService } from '@/services/api.service.ts'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

interface FetchCourtsResponse {
  status: string
  data: {
    courts: Court[]
  }
}

interface FetchCourtByIdResponse {
  status: string
  data: {
    court: Court
  }
}

interface FetchCourtBookingsResponse {
  status: string
  data: {
    bookings: Booking[]
  }
}

const fetchCourts = async () => {
  return apiService.request<FetchCourtsResponse>('/courts')
}

const fetchCourtById = async (id: number) => {
  return apiService.request<FetchCourtByIdResponse>(`/courts/${id}`)
}

const fetchCourtBookings = async (courtId: number, date?: Date) => {
  const endpoint = date
    ? `/courts/${courtId}/bookings?date=${format(date, 'yyyy-MM-dd')}`
    : `/courts/${courtId}/bookings`

  return apiService.request<FetchCourtBookingsResponse>(endpoint)
}

export const useCourts = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['courts'],
    queryFn: fetchCourts,
    staleTime: 1 * 69 * 1000,
    retry: 3,
  })

  return {
    courts: data?.data?.courts,
    isLoading,
    error,
  }
}

export const useCourt = (id: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['court', id],
    queryFn: () => fetchCourtById(id),
    staleTime: 1 * 69 * 1000,
    retry: 3,
  })

  return { court: data?.data.court, isLoading, error }
}

export const useCourtBookings = (courtId: number, date?: Date) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'court-bookings',
      courtId,
      date ? format(date, 'yyyy-MM-dd') : 'all',
    ],
    queryFn: () => fetchCourtBookings(courtId, date),
    staleTime: 1 * 30 * 1000,
    retry: 3,
    enabled: !!courtId,
  })

  return {
    bookings: data?.data?.bookings || [],
    isLoading,
    error,
    refetch,
  }
}
