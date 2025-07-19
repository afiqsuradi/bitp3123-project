export type CourtStatus = 'AVAILABLE' | 'MAINTENANCE' | 'CLOSED'

export type Court = {
  id: number
  name: string
  location: string
  status: string
}
