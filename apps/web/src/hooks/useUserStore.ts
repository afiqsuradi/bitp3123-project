import { useStore } from '@tanstack/react-store'
import { userStore, selectUser, selectIsLoggedIn } from '@/stores/userStore.ts'

export const useUserStore = () => {
  const user = useStore(userStore, selectUser)
  const isLoggedIn = useStore(userStore, selectIsLoggedIn)
  return { user, isLoggedIn }
}
