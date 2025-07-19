import type { Court } from '@/types/court.type.ts'
import { apiService } from '@/services/api.service.ts'
import { useQuery } from '@tanstack/react-query'

interface FetchCourtsResponse {
  status: string
  data: {
    courts: Court[]
  }
}

const fetchCourts = async () => {
  return apiService.request<FetchCourtsResponse>('/courts')
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
