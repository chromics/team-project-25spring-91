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
import { toast } from 'sonner'
import type { Gym } from '@/types/gym'
import PreviewDialog from './preview-dialog'
import { X, Upload } from 'lucide-react'

interface AddCompetitionFormProps {
  gym: Gym
  onClose: () => void
}

interface CompetitionFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxParticipants: string
  entryFee: string
  category: string
  rules: string
  prizes: string
}

const AddCompetitionForm = ({ gym, onClose }: AddCompetitionFormProps) => {
  const [formData, setFormData] = useState<CompetitionFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    entryFee: '',
    category: 'bodybuilding',
    rules: '',
    prizes: '',
  })
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

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('startDate', formData.startDate)
      submitData.append('endDate', formData.endDate)
      submitData.append('registrationDeadline', formData.registrationDeadline)
      submitData.append('maxParticipants', formData.maxParticipants)
      submitData.append('entryFee', formData.entryFee)
      submitData.append('category', formData.category)
      submitData.append('rules', formData.rules)
      submitData.append('prizes', formData.prizes)
      submitData.append('gymId', gym.id.toString())

      if (imageFile) {
        submitData.append('image', imageFile)
      }

      // Replace with actual API call
      // const response = await api.post('/competitions', submitData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // })

      toast.success('Competition created successfully!')
      onClose()
    } catch (error: any) {
      console.error('Error creating competition:', error)
      toast.error('Failed to create competition. Please try again.')
    } finally {
      setIsSubmitting(false)
      setShowPreview(false)
    }
  }

  const previewData = {
    ...formData,
    imagePreview,
    gymName: gym.name,
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Competition Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Summer Bodybuilding Championship"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bodybuilding">Bodybuilding</SelectItem>
                <SelectItem value="powerlifting">Powerlifting</SelectItem>
                <SelectItem value="crossfit">CrossFit</SelectItem>
                <SelectItem value="weightlifting">Weightlifting</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
            <Input
              id="registrationDeadline"
              name="registrationDeadline"
              type="datetime-local"
              value={formData.registrationDeadline}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Input
              id="maxParticipants"
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              placeholder="100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryFee">Entry Fee ($)</Label>
            <Input
              id="entryFee"
              name="entryFee"
              type="number"
              value={formData.entryFee}
              onChange={handleInputChange}
              placeholder="50.00"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the competition..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rules">Rules & Regulations</Label>
          <Textarea
            id="rules"
            name="rules"
            value={formData.rules}
            onChange={handleInputChange}
            placeholder="Competition rules and regulations..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prizes">Prizes</Label>
          <Textarea
            id="prizes"
            name="prizes"
            value={formData.prizes}
            onChange={handleInputChange}
            placeholder="1st Place: $1000, 2nd Place: $500, 3rd Place: $250"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Competition Poster</Label>
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
                      Upload a poster
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
        title="Competition Preview"
        data={previewData}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default AddCompetitionForm
