import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { useUserStore } from '@/hooks/useUserStore'

export default function Header() {
  const { isLoggedIn } = useUserStore()
  return (
    <header className="flex justify-center py-4 border-b border-gray-200 ">
      <nav className="container flex flex-row w-full justify-between items-center">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>
        <ol className="flex flex-row gap-4">
          {isLoggedIn ? (
            <p>Logged In</p>
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
