import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge.tsx'
import { GiTennisCourt } from 'react-icons/gi'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import { GoClock } from 'react-icons/go'
import { Button } from '@/components/ui/button.tsx'
import type { Court } from '@/types/court.type.ts'
import { capitalizeFirstLetter, cn } from '@/lib/utils.ts'
import { useNavigate } from '@tanstack/react-router'

interface Props {
  courts: Court
}

export function CourtCard({ courts }: Props) {
  const navigate = useNavigate()
  return (
    <Card className="max-w-md py-0 overflow-y-auto">
      <CardHeader className="bg-primary/20 flex-1 pt-6 flex flex-col">
        <Badge
          className={cn(
            'font-semibold',
            courts.status.toLowerCase() === 'available'
              ? 'bg-green-600'
              : courts.status.toLowerCase() === 'maintenance'
                ? 'bg-yellow-600'
                : 'bg-red-600',
          )}
        >
          {capitalizeFirstLetter(courts.status)}
        </Badge>
        <GiTennisCourt className="h-24 w-24 text-primary/60 mx-auto mb-6" />
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="font-bold text-lg">{courts.name}</h3>
        <div className="flex flex-row gap-1 items-center text-sm text-foreground/70">
          <HiOutlineLocationMarker className="h-4 w-4" />
          <p>{courts.location}</p>
        </div>
      </CardContent>
      <CardFooter className="pb-6 flex justify-between items-center">
        <div className="flex flex-row gap-1 items-center text-sm text-foreground/70">
          <GoClock className="h-4 w-4" />
          Available Now
        </div>
        <div>
          <Button
            variant={
              courts.status.toLowerCase() === 'available'
                ? 'default'
                : 'outline'
            }
            disabled={courts.status.toLowerCase() !== 'available'}
            onClick={() => {
              navigate({ to: `/court/${courts.id}` })
            }}
          >
            {courts.status.toLowerCase() === 'available'
              ? 'Book Now'
              : 'Unavailable'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
