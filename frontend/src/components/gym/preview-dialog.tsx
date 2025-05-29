"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  data: any
  onConfirm: () => void
  isSubmitting: boolean
}

const PreviewDialog = ({
  open,
  onOpenChange,
  title,
  data,
  onConfirm,
  isSubmitting,
}: PreviewDialogProps) => {
  const renderPreviewContent = () => {
    if (title.includes('Subscription')) {
      return (
        <div className="space-y-4">
          {data.imagePreview && (
            <img
              src={data.imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
            />
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-sm text-gray-600">
              ${data.price} for {data.duration} {data.durationType}
            </p>
            <p className="text-sm">{data.description}</p>
            {data.features && (
              <div>
                <p className="font-medium text-sm">Features:</p>
                <p className="text-sm">{data.features}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (title.includes('Class')) {
      return (
        <div className="space-y-4">
          {data.imagePreview && (
            <img
              src={data.imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
            />
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-sm text-gray-600">
              {data.durationMinutes} minutes • {data.difficultyLevel} • Max {data.maxCapacity} people
            </p>
            <p className="text-sm">{data.description}</p>
            {data.membersOnly && (
              <p className="text-sm font-medium text-blue-600">Members Only</p>
            )}
            {data.schedules && data.schedules.length > 0 && (
              <div>
                <p className="font-medium text-sm">Schedules:</p>
                {data.schedules.map((schedule: any) => (
                  <div key={schedule.id} className="text-sm border-l-2 border-gray-200 pl-2">
                    <p>{new Date(schedule.startTime).toLocaleString()} - {new Date(schedule.endTime).toLocaleString()}</p>
                    <p>Instructor: {schedule.instructor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (title.includes('Competition')) {
      return (
        <div className="space-y-4">
          {data.imagePreview && (
            <img
              src={data.imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
            />
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-sm text-gray-600">
              {data.category} • Entry Fee: ${data.entryFee} • Max {data.maxParticipants} participants
            </p>
            <div className="text-sm">
              <p><strong>Start:</strong> {new Date(data.startDate).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(data.endDate).toLocaleString()}</p>
              <p><strong>Registration Deadline:</strong> {new Date(data.registrationDeadline).toLocaleString()}</p>
            </div>
            <p className="text-sm">{data.description}</p>
            {data.rules && (
              <div>
                <p className="font-medium text-sm">Rules:</p>
                <p className="text-sm">{data.rules}</p>
              </div>
            )}
            {data.prizes && (
              <div>
                <p className="font-medium text-sm">Prizes:</p>
                <p className="text-sm">{data.prizes}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {renderPreviewContent()}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Confirm & Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PreviewDialog
