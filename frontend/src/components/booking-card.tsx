'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  XCircle,
  CheckCircle,
  ExternalLink,
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
} from '@/components/ui/alert-dialog';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Booking, BookingStatus } from '@/types/gym';

const statusStyles: Record<BookingStatus, string> = {
  confirmed: 'bg-accent text-accent-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
  attended: 'bg-muted text-muted-foreground',
};

interface BookingCardProps {
  booking: Booking;
  onCancelSuccess?: () => void;
  onAttendSuccess?: () => void;
}

export function BookingCard({
  booking,
  onCancelSuccess,
  onAttendSuccess,
}: BookingCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAttendLoading, setIsAttendLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAttendDialog, setShowAttendDialog] = useState(false);

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

  const handleMarkAsAttended = async () => {
    setIsAttendLoading(true);
    try {
      await api.put(`/bookings/${booking.id}/mark-attended`);
      onAttendSuccess?.();
      setShowAttendDialog(false);
    } catch (error) {
      console.error('Error marking as attended:', error);
    } finally {
      setIsAttendLoading(false);
    }
  };

  const statusStyle = statusStyles[booking.bookingStatus];
  const isUpcoming = new Date(booking.schedule.startTime) > new Date();
  const isPast = new Date(booking.schedule.endTime) < new Date();
  const canCancel = isUpcoming && booking.bookingStatus === 'confirmed';
  const canMarkAttended = isPast && booking.bookingStatus === 'confirmed';

  return (
    <>
      <Card className="group relative overflow-hidden transition-all hover:shadow-sm">
        <CardContent className="space-y-4 p-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                {booking.schedule.gymClass.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {booking.schedule.gymClass.gym.name}
              </p>
            </div>
            <Badge variant="secondary" className={statusStyle}>
              {booking.bookingStatus}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(booking.schedule.startTime), 'EEE, MMM d, yyyy')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(booking.schedule.startTime), 'h:mm a')} -
                {format(new Date(booking.schedule.endTime), 'h:mm a')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{booking.schedule.instructor}</span>
            </div>
          </div>

          {/* View Gym Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs border-dashed"
            onClick={() =>
              router.push(
                `/dashboard/gym-list/${booking.schedule.gymClass.gym.id}`
              )
            }
          >
            <ExternalLink className="mr-2 h-3 w-3" />
            View Gym Details
          </Button>
        </CardContent>

        {/* Action Buttons */}
        {(canCancel || canMarkAttended) && (
          <CardFooter className="border-t bg-muted/30 p-3">
            <div className="flex w-full gap-2">
              {canMarkAttended && (
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setShowAttendDialog(true)}
                  disabled={isAttendLoading}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {isAttendLoading ? 'Marking...' : 'Mark Attended'}
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    canMarkAttended ? 'flex-1' : 'w-full'
                  } text-xs text-destructive hover:bg-destructive/5`}
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isLoading}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  {isLoading ? 'Cancelling...' : 'Cancel'}
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your booking for{' '}
              <span className="font-medium">
                {booking.schedule.gymClass.name}
              </span>
              ? This action cannot be undone.
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

      {/* Attend Dialog */}
      <AlertDialog open={showAttendDialog} onOpenChange={setShowAttendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Attended</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that you attended{' '}
              <span className="font-medium">
                {booking.schedule.gymClass.name}
              </span>{' '}
              on{' '}
              {format(new Date(booking.schedule.startTime), 'MMMM d, yyyy')}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsAttended}
              disabled={isAttendLoading}
            >
              {isAttendLoading ? 'Marking...' : 'Yes, I Attended'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
