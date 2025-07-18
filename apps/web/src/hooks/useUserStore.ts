import { useStore } from '@tanstack/react-store'
import {
  userStore,
  selectUser,
  selectIsLoggedIn,
  selectIsLoading,
} from '@/stores/userStore.ts'

export const useUserStore = () => {
  const user = useStore(userStore, selectUser)
  const isLoggedIn = useStore(userStore, selectIsLoggedIn)
  const isLoading = useStore(userStore, selectIsLoading)
  return { user, isLoggedIn, isLoading }
}
