import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { apiService } from '@/services/api.service.ts'
import { useState } from 'react'
import { ApiError } from '@/types/errors.type.ts'
import { setUser, clearUser } from '@/stores/userStore.ts'

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

interface RegisterRequest {
  name: string
  email: string
  password: string
}

interface RegisterResponse {
  status: string
  message: string
}

export const useRegister = () => {
  const initialValidationError = {
    name: '',
    password: '',
    email: '',
  }
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<{
    name: string
    password: string
    email: string
  }>(initialValidationError)
  const [success, setSuccess] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (credentials: RegisterRequest): Promise<RegisterResponse> => {
      setError(null)
      setValidationError(initialValidationError)
      setSuccess(null)
      return apiService.register(credentials)
    },
    onSuccess: (data) => {
      if (data.status === 'success') {
        setSuccess('Registration successful, you may now login')
      }
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
  })
  return {
    error,
    validationError,
    setValidationError,
    success,
    mutateRegister: mutation.mutate,
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
      setUser(data.data.loggedInUserData)
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
      clearUser()
      navigate({ to: '/', reloadDocument: true })
    },
    onError: (error) => {
      console.error('Logout error:', error)
      queryClient.clear()
      navigate({ to: '/auth/login' })
    },
  })
}
