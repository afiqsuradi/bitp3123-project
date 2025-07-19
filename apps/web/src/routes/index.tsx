import { createFileRoute } from '@tanstack/react-router'
import { useUserStore } from '@/hooks/useUserStore'
import { Badge } from '@/components/ui/badge.tsx'
import { CourtCard } from '@/components/ui/CourtCard.tsx'
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { isLoading } = useUserStore()
  if (isLoading) return <div>Loading...</div>
  return (
    <main className="flex flex-col justify-center bg-background min-h-lvh">
      <section className="text-center flex flex-col justify-center items-center gap-4 py-16">
        <h1 className="text-5xl font-bold leading-tight">
          Book Your Perfect{' '}
          <span className="text-primary">Badminton Court</span>
        </h1>
        <p className="text-foreground/60 max-w-2xl text-2xl">
          Premium indoor and outdoor courts available for booking. Professional
          facilities with modern amenities.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Badge
            variant="outline"
            className="border-green-600 text-green-600 bg-green-100 w-full"
          >
            <span className="w-2 h-2 rounded-full bg-green-600" />
            Available
          </Badge>
          <Badge
            className="border-yellow-600 text-yellow-600 bg-yellow-100 w-full"
            variant="outline"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-600" />
            In Use
          </Badge>
        </div>
      </section>
      <section className="flex justify-center items-center mb-12 flex-1 align-center">
        <div className="container grid grid-cols-3">
          <CourtCard />
          <CourtCard />
          <CourtCard />
        </div>
      </section>
    </main>
  )
}
