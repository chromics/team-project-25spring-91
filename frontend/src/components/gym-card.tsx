"use client"

import type { FC } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import type { Gym } from '@/types/gym'
import { Button } from './ui/button'
import BookingDialog from '@/components/gym/booking-dialog'
import MembershipDialog from './gym/membership-dialog'

interface GymCardProps {
  gym: Gym
}

const GymCard: FC<GymCardProps> = ({ gym }) => {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [membershipOpen, setMembershipOpen] = useState(false)

  return (
    <>
      <Card className="w-full border-0 shadow-none flex flex-col">
        <div className="aspect-square relative w-full overflow-hidden rounded-lg">
          {gym.imageUrl && (
            <Image
              src={gym.imageUrl}
              alt={gym.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          )}
        </div>
        <CardContent className="px-0 pt-2 pb-0 space-y-1">
          <CardTitle className="text-sm truncate">{gym.name}</CardTitle>
          <CardDescription className="text-xs truncate">{gym.location}</CardDescription>
          <CardDescription className="text-xs line-clamp-1">{gym.description}</CardDescription>
        </CardContent>
        <CardFooter className="px-0 mt-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setMembershipOpen(true)}
          >
            Join
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setBookingOpen(true)}
          >
            Book
          </Button>
        </CardFooter>
      </Card>

      <BookingDialog
        gym={gym}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />

      {/* You can add MembershipDialog here later if needed */}
      <MembershipDialog
        gym={gym}
        open={membershipOpen}
        onOpenChange={setMembershipOpen}
      />
    </>
  )
}

export default GymCard