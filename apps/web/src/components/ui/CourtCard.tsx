import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge.tsx'
import { GiTennisCourt } from 'react-icons/gi'
import { HiOutlineLocationMarker } from 'react-icons/hi'
import { GoClock } from 'react-icons/go'
import { Button } from '@/components/ui/button.tsx'

export function CourtCard() {
  return (
    <Card className="max-w-md py-0 overflow-y-auto">
      <CardHeader className="bg-primary/20 flex-1 pt-6 flex flex-col">
        <Badge className="bg-green-600 font-semibold">Available</Badge>
        <GiTennisCourt className="h-24 w-24 text-primary/60 mx-auto mb-6" />
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="font-bold text-lg">Court Alpha</h3>
        <div className="flex flex-row gap-1 items-center text-sm text-foreground/70">
          <HiOutlineLocationMarker className="h-4 w-4" />
          <p>Building A, Floor 1</p>
        </div>
      </CardContent>
      <CardFooter className="pb-6 flex justify-between items-center">
        <div className="flex flex-row gap-1 items-center text-sm text-foreground/70">
          <GoClock className="h-4 w-4" />
          Available Now
        </div>
        <div>
          <Button variant="default">Book Now</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
