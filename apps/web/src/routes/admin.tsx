import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUserStore } from '@/hooks/useUserStore.ts'
import { useAllBookings, useCourts, useUpdateBookingStatus } from '@/hooks/api/useCourt.ts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { user, isLoggedIn, isLoading: isUserDataLoading } = useUserStore()
  const [selectedCourt, setSelectedCourt] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  
  const { courts } = useCourts()
  const { bookings, isLoading, refetch } = useAllBookings({
    courtId: selectedCourt === 'ALL' ? undefined : Number(selectedCourt),
    status: selectedStatus
  })
  const { mutateUpdateBookingStatus, isLoading: isUpdating } = useUpdateBookingStatus()

  useEffect(() => {
    if (!isUserDataLoading && !isLoggedIn) {
      navigate({ to: '/auth/login' })
    }

    if (user && user.role !== 'ADMIN') {
      navigate({ to: '/' })
    }
  }, [isUserDataLoading, user])

  const handleStatusUpdate = (bookingId: number, newStatus: string) => {
    mutateUpdateBookingStatus(
      { bookingId, status: newStatus },
      {
        onSuccess: () => {
          refetch()
        }
      }
    )
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'outline'
      case 'CONFIRMED':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatDateTime = (dateTime: string | Date) => {
    const date = new Date(dateTime)
    return date.toLocaleString()
  }

  if (isUserDataLoading || !user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin - Booking Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Filter by Court:</label>
              <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Courts</SelectItem>
                  {courts?.map((court) => (
                    <SelectItem key={court.id} value={court.id.toString()}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Filter by Status:</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-4">Loading bookings...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">#{booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.user.name}</div>
                          <div className="text-sm text-gray-500">{booking.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.court.name}</TableCell>
                      <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                      <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {booking.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                disabled={isUpdating}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                disabled={isUpdating}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status !== 'PENDING' && (
                            <span className="text-sm text-gray-500">No actions available</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
