import { Link } from '@tanstack/react-router'
import { PiCourtBasketballFill } from 'react-icons/pi'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/hooks/useUserStore'
import { useLogout } from '@/hooks/api/useAuth.ts'
import { Separator } from '@/components/ui/separator'

export default function Header() {
  const { isLoggedIn, user } = useUserStore()
  const { mutate: logout } = useLogout()
  return (
    <header className="flex justify-center py-4 border-b border-gray-200 shadow-sm">
      <nav className="container flex flex-row w-full justify-between items-center">
        <Link to={'/'} className="flex flex-row gap-2 items-center">
          <PiCourtBasketballFill className="h-12 w-12 text-primary color-primary" />
          <div className="flex flex-col gap-[0.05rem]">
            <h3 className="text-base font-semibold ">CourtBook</h3>
            <p className="text-sm font-medium">Badminton Court Booking</p>
          </div>
        </Link>
        <ol className="flex flex-row gap-4">
          {isLoggedIn ? (
            <>
              {user?.role.toLowerCase() === 'admin' ? (
                <Link to="/admin">
                  <Button variant="outline">Admin Panel</Button>
                </Link>
              ) : (
                <></>
              )}
              <Link to="/bookings">
                <Button variant="outline">My Bookings</Button>
              </Link>
              <Separator orientation="vertical" />
              <Button variant="outline" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="outline">Register</Button>
              </Link>
            </>
          )}
        </ol>
      </nav>
    </header>
  )
}
