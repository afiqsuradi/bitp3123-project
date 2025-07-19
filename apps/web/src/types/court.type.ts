export type CourtStatus = 'AVAILABLE' | 'MAINTENANCE' | 'CLOSED'

export type Court = {
  name: string
  location: string
  status: string
}
