import type { Court } from '@/types/court.type.ts'
import type { Booking, UserBooking } from '@/types/booking.type.ts'
import { apiService } from '@/services/api.service.ts'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ApiError } from '@/types/errors.type.ts'
import { useState } from 'react'

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

interface FetchUserCourtBookingsResponse {
  status: string
  data: {
    bookings: UserBooking[]
  }
}

interface AddBookingToCourtRequest {
  courtId: number
  date: string
  time: string
  duration: number
}

interface AddBookingToCourtResponse {
  status: string
  data: {
    booking: Booking
  }
}

const fetchUserCourtBookings = async () => {
  return apiService.request<FetchUserCourtBookingsResponse>(
    `/courts/bookings/me`,
  )
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

const updateBookingStatus = async (bookingId: number, status: string) => {
  return apiService.request(`/courts/bookings/${bookingId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

const addBookingToCourt = async ({
  courtId,
  date,
  time,
  duration,
}: AddBookingToCourtRequest) => {
  return apiService.request<AddBookingToCourtResponse>(
    `/courts/${courtId}/bookings`,
    {
      method: 'POST',
      body: JSON.stringify({
        courtId,
        date,
        time,
        duration,
      }),
    },
  )
}

export const useUpdateBookingStatus = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const mutation = useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: number
      status: string
    }) => updateBookingStatus(bookingId, status),
    onSettled: () => {
      setIsLoading(false)
    },
    onSuccess: () => {
      setIsSuccess(true)
    },
    onMutate: () => {
      setIsLoading(true)
    },
  })

  return {
    mutateUpdateBookingStatus: mutation.mutate,
    isLoading,
    setIsSuccess,
    isSuccess,
  }
}

export const useUserCourtBookings = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-court-bookings'],
    queryFn: () => fetchUserCourtBookings(),
    staleTime: 1 * 69 * 1000,
    retry: 3,
  })
  return {
    bookings: data?.data?.bookings || [],
    isLoading,
    error,
    refetch,
  }
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

export const useAddBookingToCourt = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const initialValidationError = {
    date: '',
    time: '',
    duration: '',
  }
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<{
    date: string
    time: string
    duration: string
  }>(initialValidationError)
  const mutation = useMutation({
    mutationFn: ({
      courtId,
      date,
      time,
      duration,
    }: AddBookingToCourtRequest) => {
      setIsLoading(true)
      return addBookingToCourt({ courtId, date, time, duration })
    },
    onSuccess: (data) => {
      console.log(data)
    },
    onError: (error: ApiError) => {
      if (error.status === 400 && error.response?.errors) {
        for (const fieldError of error.response.errors) {
          setValidationError((prev) => ({
            ...prev,
            [fieldError.field]: fieldError.message,
          }))
        }
        return
      }
      setError(error.message)
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  return {
    mutateAddBooking: mutation.mutate,
    error,
    validationError,
    setValidationError,
    isLoading,
  }
}
