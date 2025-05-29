"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { Gym } from '@/types/gym'
import PreviewDialog from './preview-dialog'
import { X, Upload, Plus, Trash2 } from 'lucide-react'

interface AddGymClassFormProps {
  gym: Gym
  onClose: () => void
}

interface Schedule {
  id: string
  startTime: string
  endTime: string
  instructor: string
}

interface GymClassFormData {
  name: string
  description: string
  maxCapacity: string
  durationMinutes: string
  difficultyLevel: string
  membersOnly: boolean
}

const AddGymClassForm = ({ gym, onClose }: AddGymClassFormProps) => {
  const [formData, setFormData] = useState<GymClassFormData>({
    name: '',
    description: '',
    maxCapacity: '',
    durationMinutes: '',
    difficultyLevel: 'beginner',
    membersOnly: false,
  })
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
  }

  const addSchedule = () => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      startTime: '',
      endTime: '',
      instructor: '',
    }
    setSchedules([...schedules, newSchedule])
  }

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id))
  }

  const updateSchedule = (id: string, field: keyof Schedule, value: string) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, [field]: value } : schedule
      )
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('maxCapacity', formData.maxCapacity)
      submitData.append('durationMinutes', formData.durationMinutes)
      submitData.append('difficultyLevel', formData.difficultyLevel)
      submitData.append('membersOnly', formData.membersOnly.toString())
      submitData.append('gymId', gym.id.toString())
      submitData.append('schedules', JSON.stringify(schedules))

      if (imageFile) {
        submitData.append('image', imageFile)
      }

      // Use actual API call for classes
      // const response = await api.post('/classes', submitData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // })

      toast.success('Gym class created successfully!')
      onClose()
    } catch (error: any) {
      console.error('Error creating gym class:', error)
      toast.error('Failed to create gym class. Please try again.')
    } finally {
      setIsSubmitting(false)
      setShowPreview(false)
    }
  }

  const previewData = {
    ...formData,
    schedules,
    imagePreview,
    gymName: gym.name,
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Yoga Class"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxCapacity">Max Capacity</Label>
            <Input
              id="maxCapacity"
              name="maxCapacity"
              type="number"
              value={formData.maxCapacity}
              onChange={handleInputChange}
              placeholder="20"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              value={formData.durationMinutes}
              onChange={handleInputChange}
              placeholder="60"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficultyLevel">Difficulty Level</Label>
            <Select
              value={formData.difficultyLevel}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, difficultyLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the class..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="membersOnly"
            checked={formData.membersOnly}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, membersOnly: !!checked }))
            }
          />
          <Label htmlFor="membersOnly">Members Only</Label>
        </div>

        <div className="space-y-2">
          <Label>Class Image</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <Label htmlFor="image" className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-500">
                      Upload an image
                    </span>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Class Schedules</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSchedule}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>

          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="grid grid-cols-4 gap-2 p-3 border rounded-lg"
            >
              <div className="space-y-1">
                <Label className="text-xs">Start Time</Label>
                <Input
                  type="datetime-local"
                  value={schedule.startTime}
                  onChange={(e) =>
                    updateSchedule(schedule.id, 'startTime', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Time</Label>
                <Input
                  type="datetime-local"
                  value={schedule.endTime}
                  onChange={(e) =>
                    updateSchedule(schedule.id, 'endTime', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Instructor</Label>
                <Input
                  value={schedule.instructor}
                  onChange={(e) =>
                    updateSchedule(schedule.id, 'instructor', e.target.value)
                  }
                  placeholder="John Smith"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSchedule(schedule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex-1"
          >
            Preview
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>

      <PreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        title="Gym Class Preview"
        data={previewData}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default AddGymClassForm
