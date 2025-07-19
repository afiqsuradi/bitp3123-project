import { createFileRoute } from '@tanstack/react-router'
import { useCourt } from '@/hooks/api/useCourt.ts'
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx'
import { capitalizeFirstLetter, cn, isNumber } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import { GiTennisCourt } from 'react-icons/gi'
import { IoCalendarClearOutline } from 'react-icons/io5'
import { CourtBookingForm } from '@/components/court/CourtBookingForm.tsx'

export const Route = createFileRoute('/court/$courtId')({
  beforeLoad: ({ params }) => {
    if (!params.courtId || !isNumber(params.courtId)) {
      return {
        redirect: {
          to: '/',
        },
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { courtId } = Route.useParams()
  const { court, isLoading } = useCourt(Number(courtId))
  if (isLoading) return <div>Loading...</div>

  if (!court)
    return (
      <div>
        <h1>Court not found</h1>
      </div>
    )

  return (
    <div className="flex justify-center items-center min-h-screen bg-background overflow-y-auto py-20">
      <div className="container mx-auto grid grid-rows-2 gap-4 place-items-center">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">{court.name}</h1>
              <Badge
                className={cn(
                  'font-semibold',
                  court.status.toLowerCase() === 'available'
                    ? 'bg-green-600'
                    : court.status.toLowerCase() === 'maintenance'
                      ? 'bg-yellow-600'
                      : 'bg-red-600',
                )}
              >
                {capitalizeFirstLetter(court.status)}
              </Badge>
            </div>
            <div className="flex flex-row gap-1 items-center text-sm text-foreground/70">
              <HiOutlineLocationMarker className="h-4 w-4" />
              <p>{court.location}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-foreground/5 rounded-lg py-8">
              <GiTennisCourt className="h-24 w-24 text-primary/60 mx-auto" />
            </div>
          </CardContent>
        </Card>
        <Card className="max-w-xl w-full">
          <CardHeader className="flex flex-row items-center font-semibold text-xl">
            <IoCalendarClearOutline className="h-5 w-5" />
            <h1>Book Your Session</h1>
          </CardHeader>
          <CardContent>
            <CourtBookingForm courtId={court.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
