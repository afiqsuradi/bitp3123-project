import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUserStore } from '@/hooks/useUserStore.ts'
import { useEffect } from 'react'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { user, isLoggedIn, isLoading: isUserDataLoading } = useUserStore()

  useEffect(() => {
    if (!isUserDataLoading && !isLoggedIn) {
      navigate({ to: '/auth/login' })
    }

    if (user && user.role !== 'ADMIN') {
      navigate({ to: '/' })
    }
  }, [isUserDataLoading, user])
  return <div>Hello "/admin"!</div>
}
