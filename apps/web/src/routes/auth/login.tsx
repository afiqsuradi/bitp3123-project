import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/api/useAuth'
import { ImSpinner8 } from 'react-icons/im'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { error, setError, mutateLogin, isLoading } = useLogin()

  const handleSubmit = () => {
    setError(null)
    mutateLogin({
      email,
      password,
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2 w-full h-full">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex-col space-y-2 w-full">
            <Button
              type="submit"
              className="w-full hover:cursor-pointer"
              disabled={isLoading}
              onClick={() => handleSubmit()}
            >
              {isLoading ? (
                <ImSpinner8 className="transform animate-spin" />
              ) : (
                'Login'
              )}
            </Button>
            <Link to="/auth/register" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full hover:cursor-pointer"
              >
                Register
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
