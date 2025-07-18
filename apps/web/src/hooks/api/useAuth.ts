import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { apiService } from '@/services/api.service.ts'
import { useState } from 'react'
import { ApiError } from '@/types/errors.type.ts'

interface LoginRequest {
  email: string
  password: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface LoginResponse {
  status: string
  message: string
  data: {
    loggedInUserData: User
  }
}

export const useLogin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest): Promise<LoginResponse> =>
      apiService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.data.loggedInUserData)
      navigate({ to: '/' })
    },
    onError: (error: ApiError) => {
      if (error.status === 401) {
        setError('Invalid credentials')
        return
      }
      setError(error.message)
    },
  })
  return {
    error,
    setError,
    mutateLogin: mutation.mutate,
  }
}

export const useLogout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      queryClient.clear()
      navigate({ to: '/auth/login' })
    },
    onError: (error) => {
      console.error('Logout error:', error)
      queryClient.clear()
      navigate({ to: '/auth/login' })
    },
  })
}
