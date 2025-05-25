'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from '@/lib/api';
import { useRouter } from 'next/navigation'
import { Booking, BookingStatus } from '@/types/gym';


const statusStyles: Record<BookingStatus, string> = {
  confirmed: 'bg-accent text-accent-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
  completed: 'bg-muted text-muted-foreground',
};



interface BookingCardProps {
  booking: Booking;
  onCancelSuccess?: () => void;
}

export function BookingCard({ booking, onCancelSuccess }: BookingCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelBooking = async () => {
    setIsLoading(true);
    try {
      await api.put(`/bookings/${booking.id}/cancel`);
      onCancelSuccess?.();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const statusStyle = statusStyles[booking.bookingStatus];
  const isUpcoming = new Date(booking.schedule.startTime) > new Date();
  const canCancel = isUpcoming && booking.bookingStatus === 'confirmed';

  return (
    <>
      <Card className="group relative overflow-hidden border bg-card transition-all hover:shadow-sm">
        <CardContent className="space-y-4 p-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{booking.schedule.gymClass.name}</h3>
              <p className="text-sm text-muted-foreground">
                {booking.schedule.gymClass.gym.name}
              </p>
            </div>
            <Badge variant="secondary" className={statusStyle}>
              {booking.bookingStatus}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(booking.schedule.startTime), 'EEE, MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(booking.schedule.startTime), 'h:mm a')} -
                {format(new Date(booking.schedule.endTime), 'h:mm a')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{booking.schedule.instructor}</span>
            </div>

            {/* <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">
                {booking.schedule.gymClass.gym.address}
              </span>
            </div> */}

            <Button
              size="sm"
              className="flex-1 text-xs cursor-pointer"
              onClick={() => router.push(`/dashboard/gym-list/${booking.schedule.gymClass.gym.id}`)}
            >
              Go to gym
            </Button>
          </div>
        </CardContent>

        {canCancel && (
          <CardFooter className="border-t bg-card/50 p-4">
            <Button
              variant="ghost"
              className="w-full hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setShowCancelDialog(true)}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Booking
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your booking for{' '}
              <span className="font-medium">{booking.schedule.gymClass.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}