import type { Gym } from '@/types/gym'
import { getGyms } from '@/lib/gym'
import GymCard from '@/components/gym-card'

export default async function GymsPage() {
  const gyms: Gym[] = await getGyms()

  return (
    <div className="
  p-4 sm:p-6 lg:p-8
  grid
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-5
  xl:grid-cols-6
  gap-7
  [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))]
  max-w-full
  animate-fade-in
">
      {gyms.map((gym) => (
        <GymCard key={gym.id} gym={gym} />
      ))}
    </div>
  )
}
