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
import { useState, useEffect, useMemo } from 'react'
import { IoCalendarClearOutline } from 'react-icons/io5'
import { cn } from '@/lib/utils.ts'
import { useCourtBookings } from '@/hooks/api/useCourt.ts'
import { Input } from '@/components/ui/input.tsx'
import type { Booking } from '@/types/booking.type.ts'

interface CourtBookingFormProps {
  courtId: number
}

interface FormErrors {
  time?: string
  duration?: string
  date?: string
}

interface DurationOption {
  value: string
  label: string
  minutes: number
}

export function CourtBookingForm({ courtId }: CourtBookingFormProps) {
  const navigate = useNavigate()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('10:30')
  const [selectedDuration, setSelectedDuration] = useState<string>('')
  const [errors, setErrors] = useState<FormErrors>({})

  const { bookings, isLoading, error } = useCourtBookings(courtId, date)

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const isTimeSlotBooked = useMemo(() => {
    if (!bookings || !selectedTime || !date) return false

    const selectedDateTime = new Date(date)
    const [hours, minutes] = selectedTime.split(':').map(Number)
    selectedDateTime.setHours(hours, minutes, 0, 0)

    return bookings.some((booking: Booking) => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      return selectedDateTime >= bookingStart && selectedDateTime < bookingEnd
    })
  }, [bookings, selectedTime, date])

  const availableDurations = useMemo((): DurationOption[] => {
    if (!bookings || !selectedTime || !date) return []

    const selectedMinutes = timeToMinutes(selectedTime)

    const sortedBookings = [...bookings]
      .map((booking: Booking) => ({
        ...booking,
        startMinutes: timeToMinutes(
          format(new Date(booking.startTime), 'HH:mm'),
        ),
        endMinutes: timeToMinutes(format(new Date(booking.endTime), 'HH:mm')),
      }))
      .sort((a, b) => a.startMinutes - b.startMinutes)

    const nextBooking = sortedBookings.find(
      (booking) => booking.startMinutes > selectedMinutes,
    )

    const endOfDay = 22 * 60 // 10 PM in minutes
    const maxEndTime = nextBooking ? nextBooking.startMinutes : endOfDay
    const maxDurationMinutes = maxEndTime - selectedMinutes

    const durations: DurationOption[] = []
    for (
      let minutes = 30;
      minutes <= maxDurationMinutes && minutes <= 480;
      minutes += 30
    ) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60

      let label: string
      if (hours === 0) {
        label = `${mins} minutes`
      } else if (mins === 0) {
        label = hours === 1 ? '1 hour' : `${hours} hours`
      } else {
        label = `${hours}h ${mins}m`
      }

      durations.push({
        value: minutes.toString(),
        label,
        minutes,
      })
    }

    return durations
  }, [bookings, selectedTime, date])

  useEffect(() => {
    const newErrors: FormErrors = {}

    if (selectedTime) {
      if (isTimeSlotBooked) {
        newErrors.time = 'This time slot is already booked'
      }
    }

    if (availableDurations.length === 0 && selectedTime && !isTimeSlotBooked) {
      newErrors.time = 'No available time slots after this time'
      setSelectedDuration('')
    }

    if (
      selectedDuration &&
      !availableDurations.find((d) => d.value === selectedDuration)
    ) {
      setSelectedDuration('')
    }

    setErrors(newErrors)
  }, [isTimeSlotBooked, availableDurations, selectedTime, selectedDuration])

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value)
    setSelectedDuration('') // Reset duration when time changes
  }

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
                    setSelectedDuration('') // Reset duration when date changes
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
            {errors.date && (
              <p className="text-sm text-red-500 px-1">{errors.date}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <Label htmlFor="time-picker" className="px-1">
              Time
            </Label>
            <Input
              type="time"
              id="time-picker"
              step="1800" // 30 minutes step
              value={selectedTime}
              onChange={handleTimeChange}
              className={cn(
                'bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
                errors.time && 'border-red-500',
              )}
            />
            {errors.time && (
              <p className="text-sm text-red-500 px-1">{errors.time}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          <Label htmlFor="duration-picker" className="px-1">
            Duration
          </Label>
          <Select
            value={selectedDuration}
            onValueChange={setSelectedDuration}
            disabled={availableDurations.length === 0 || !!errors.time}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  availableDurations.length === 0
                    ? 'No available durations'
                    : 'Select duration'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Available Durations</SelectLabel>
                {availableDurations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.duration && (
            <p className="text-sm text-red-500 px-1">{errors.duration}</p>
          )}
        </div>

        {/* booking summary */}
        {selectedTime && selectedDuration && !errors.time && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Booking Summary</h4>
            <p>Date: {date && format(date, 'PPP')}</p>
            <p>
              Time: {selectedTime} -{' '}
              {minutesToTime(
                timeToMinutes(selectedTime) + parseInt(selectedDuration),
              )}
            </p>
            <p>
              Duration:{' '}
              {
                availableDurations.find((d) => d.value === selectedDuration)
                  ?.label
              }
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <Button
            className="w-full"
            disabled={!selectedTime || !selectedDuration || !!errors.time}
            type="submit"
          >
            Confirm Booking
          </Button>
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
        {error && <div className="text-red-500">Error loading bookings</div>}

        {/* Debug: Show existing bookings */}
        {bookings && bookings.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">
              Existing bookings for this date:
            </h4>
            {bookings.map((booking) => (
              <div key={booking.id} className="text-sm">
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
