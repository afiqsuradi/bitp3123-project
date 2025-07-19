import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUserStore } from '@/hooks/useUserStore.ts'
import { useUserCourtBookings } from '@/hooks/api/useCourt.ts'
import { useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export const Route = createFileRoute('/bookings')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { isLoggedIn, isLoading: isUserDataLoading } = useUserStore()
  const { bookings } = useUserCourtBookings()
  
  useEffect(() => {
    if (!isUserDataLoading && !isLoggedIn) {
      navigate({ to: '/auth/login' })
    }
  }, [isUserDataLoading])

  const handleCancelBooking = (bookingId: number) => {
    // TODO: Implement cancel booking logic
    console.log('Cancel booking:', bookingId)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bookings found.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Court</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const startTime = new Date(booking.startTime)
                const endTime = new Date(booking.endTime)
                const durationInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) // Duration in minutes
                
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.court.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.court.location}
                    </TableCell>
                    <TableCell>
                      {format(startTime, 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      {durationInMinutes >= 60 
                        ? `${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60 > 0 ? `${durationInMinutes % 60}min`: ''}`
                        : `${durationInMinutes}min`
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
