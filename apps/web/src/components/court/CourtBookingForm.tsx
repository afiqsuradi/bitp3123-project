import { Label } from '@/components/ui/label.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar.tsx'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { IoCalendarClearOutline } from 'react-icons/io5'
import { cn } from '@/lib/utils.ts'
import { useCourtBookings } from '@/hooks/api/useCourt.ts'
import { Input } from '@/components/ui/input.tsx'

interface CourtBookingFormProps {
  courtId: number
}

export function CourtBookingForm({ courtId }: CourtBookingFormProps) {
  const navigate = useNavigate()
  const [date, setDate] = useState<Date | undefined>(new Date())

  const { bookings, isLoading, error } = useCourtBookings(courtId, date)

  return (
    <form>
      <div className="flex flex-col gap-5">
        <div className="flex flex-row justify-between items-center gap-2 flex-1">
          <div className="flex flex-col gap-3 flex-1">
            <Label htmlFor="date" className="px-1">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] pl-3 text-left font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  <IoCalendarClearOutline className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate)
                  }}
                  disabled={(date) => {
                    const today = new Date()
                    const currentMonth = today.getMonth()
                    const currentYear = today.getFullYear()

                    return (
                      date.getMonth() !== currentMonth ||
                      date.getFullYear() !== currentYear ||
                      date < today
                    )
                  }}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <Label htmlFor="time-picker" className="px-1">
              Time
            </Label>
            <Input
              type="time"
              id="time-picker"
              step="1"
              defaultValue="10:30:00"
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <Label htmlFor="duration-picker" className="px-1">
            Duration
          </Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button className="w-full">Confirm Booking</Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="w-full"
          >
            Cancel Booking
          </Button>
        </div>

        {isLoading && <div>Loading bookings...</div>}
        {error && <div>Error loading bookings</div>}
        {bookings && bookings.length > 0 && (
          <div>
            <h4>Existing bookings for this date:</h4>
            {bookings.map((booking) => (
              <div key={booking.id}>
                {format(new Date(booking.startTime), 'HH:mm')} -{' '}
                {format(new Date(booking.endTime), 'HH:mm')}
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}
