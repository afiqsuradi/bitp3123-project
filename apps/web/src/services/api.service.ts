import { ApiError } from '@/types/errors.type.ts'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://courtbook-rest.azurewebsites.net/api'

class ApiService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `API Error: ${response.status}`,
        response.status,
        errorData,
      )
    }
    return response.json()
  }

  login<T>(credentials: { email: string; password: string }) {
    return this.request<T>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  register<T>(credentials: { name: string; email: string; password: string }) {
    return this.request<T>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  getCurrentUser<T>() {
    return this.request<T>('/auth/me')
  }
}

export const apiService = new ApiService()
