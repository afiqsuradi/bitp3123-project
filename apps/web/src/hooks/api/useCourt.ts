import type { Court } from '@/types/court.type.ts'
import { apiService } from '@/services/api.service.ts'
import { useQuery } from '@tanstack/react-query'

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

const fetchCourts = async () => {
  return apiService.request<FetchCourtsResponse>('/courts')
}

const fetchCourtById = async (id: number) => {
  return apiService.request<FetchCourtByIdResponse>(`/courts/${id}`)
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
