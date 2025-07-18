import { Store } from '@tanstack/store'
import { apiService } from '@/services/api.service.ts'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface UserState {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
}

interface GetCurrentUserResponse {
  status: string
  data: {
    user: User
  }
}

const loadInitialState = async () => {
  try {
    userStore.setState((prevState) => ({
      ...prevState,
      isLoading: true,
    }))

    const data = await apiService.getCurrentUser<GetCurrentUserResponse>()

    if (data.status === 'success' && data.data.user) {
      setUser(data.data.user)
    }
  } catch (error) {
    console.error('Failed to load initial user state:', error)
  } finally {
    userStore.setState((prevState) => ({
      ...prevState,
      isLoading: false,
    }))
  }
}

const initialState: UserState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
}

export const userStore = new Store<UserState>(initialState)

export const setUser = (user: User) => {
  userStore.setState((prevState) => {
    return {
      ...prevState,
      user,
      isLoggedIn: true,
    }
  })
}

export const clearUser = () => {
  userStore.setState(initialState)
}

export const selectUser = (state: UserState) => state.user
export const selectIsLoggedIn = (state: UserState) => state.isLoggedIn
export const selectIsLoading = (state: UserState) => state.isLoading

loadInitialState()
