import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'

import { useRegister } from '@/hooks/api/useAuth.ts'
import { type FormEvent, useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert.tsx'
import { ImSpinner8 } from 'react-icons/im'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

interface FormState {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const initialState: FormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function RouteComponent() {
  const {
    error,
    validationError,
    setValidationError,
    success,
    mutateRegister,
    isLoading,
  } = useRegister()
  const [formData, setFormData] = useState<FormState>(initialState)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setValidationError({
        name: validationError.name ?? '',
        email: validationError.email ?? '',
        password: 'Password does not match',
      })
      return
    }
    mutateRegister({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    })
  }

  useEffect(() => {
    if (success) {
      setFormData(initialState)
    }
  }, [success])

  return (
    <form
      className="flex items-center justify-center min-h-screen bg-background"
      onSubmit={handleSubmit}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register new account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                required
              />
              {validationError?.name && (
                <p className="text-sm text-destructive">
                  {validationError.name}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              {validationError?.email && (
                <p className="text-sm text-destructive">
                  {validationError.email}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              {validationError?.password && (
                <p className="text-sm text-destructive">
                  {validationError.password}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 w-full h-full">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="flex-col space-y-2 w-full">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full hover:cursor-pointer"
            >
              {isLoading ? (
                <ImSpinner8 className="transform animate-spin" />
              ) : (
                'Register'
              )}
            </Button>
            <Link to="/auth/login" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full hover:cursor-pointer"
              >
                Login
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
