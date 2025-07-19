import { Skeleton } from './skeleton'

export function CourtCardSkeleton() {
  return (
    <Skeleton className="h-[20rem] w-[27rem] rounded-xl py-6 px-6 flex justify-between flex-col">
      <Skeleton className="h-[1.5rem] w-[4rem] rounded-full" />
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[1.5rem] w-[5rem] rounded-xl" />
        <Skeleton className="h-[1.5rem] w-[7rem] rounded-xl" />
        <div className="flex flex-row justify-between items-center mt-6">
          <Skeleton className="h-[1.5rem] w-[4rem] rounded-xl " />
          <Skeleton className="h-[2.5rem] w-[6rem] rounded-xl " />
        </div>
      </div>
    </Skeleton>
  )
}
