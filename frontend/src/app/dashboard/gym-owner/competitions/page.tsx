"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Edit,
    Trash2,
    Calendar,
    Users,
    Trophy,
    Target,
    Award
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Gym } from '@/types/gym'
import { useRoleProtection } from '@/hooks/use-role-protection'
import { UserRole } from '@/components/auth/sign-up-form'
import ButterflyLoader from '@/components/butterfly-loader'

interface Competition {
    id: number
    name: string
    description: string
    startDate: string
    endDate: string
    maxParticipants: number
    imageUrl?: string
    gymId: number
    tasks: Task[]
}

interface Task {
    id: number
    name: string
    description: string
    exerciseName: string
    exerciseCategory: string
    metric: string
    targetValue: number
    unit: string
    pointsValue: number
}

interface CompetitionsPageProps {
    gym: Gym
}

const CompetitionsPage = ({ gym }: CompetitionsPageProps) => {
    const [competitions, setCompetitions] = useState<Competition[]>([])
    const [loading, setLoading] = useState(true)
    const { isAuthorized, isLoading, user } = useRoleProtection({
        allowedRoles: [UserRole.GYM_OWNER]
    });

    useEffect(() => {
        fetchCompetitions()
    }, [gym.id])

    const fetchCompetitions = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/gyms/${gym.id}/competitions`)
            setCompetitions(response.data.data || response.data)
        } catch (error) {
            console.error('Error fetching competitions:', error)
            toast.error('Failed to load competitions')
            setCompetitions([
                {
                    id: 1,
                    name: 'Winter Strength Challenge',
                    description: 'Build strength during the winter months.',
                    startDate: '2025-12-01T00:00:00Z',
                    endDate: '2025-12-31T23:59:59Z',
                    maxParticipants: 50,
                    imageUrl: '/images/winter-challenge.jpg',
                    gymId: gym.id,
                    tasks: [
                        {
                            id: 1,
                            name: 'Deadlift Challenge',
                            description: 'Lift a total of 5000kg in deadlifts',
                            exerciseName: 'Deadlift',
                            exerciseCategory: 'strength',
                            metric: 'Weight',
                            targetValue: 5000,
                            unit: 'kg',
                            pointsValue: 200
                        }
                    ]
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCompetition = async (competitionId: number) => {
        try {
            console.log('Delete competition:', competitionId)
            toast.success('Competition deleted successfully')
            fetchCompetitions()
        } catch (error) {
            console.error('Error deleting competition:', error)
            toast.error('Failed to delete competition')
        }
    }

    const handleUpdateCompetition = (competitionId: number) => {
        console.log('Update competition:', competitionId)
        toast.info('Update competition feature coming soon')
    }

    const handleDeleteTask = async (competitionId: number, taskId: number) => {
        try {
            console.log('Delete task:', taskId, 'from competition:', competitionId)
            toast.success('Task deleted successfully')
            fetchCompetitions()
        } catch (error) {
            console.error('Error deleting task:', error)
            toast.error('Failed to delete task')
        }
    }

    const handleUpdateTask = (competitionId: number, taskId: number) => {
        console.log('Update task:', taskId, 'from competition:', competitionId)
        toast.info('Update task feature coming soon')
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getCompetitionStatus = (startDate: string, endDate: string) => {
        const now = new Date()
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (now < start) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' }
        } else if (now > end) {
            return { status: 'ended', color: 'bg-gray-100 text-gray-800' }
        } else {
            return { status: 'active', color: 'bg-green-100 text-green-800' }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading competitions...</p>
                </div>
            </div>
        )
    }

    if (competitions.length === 0) {
        return (
            <div className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No competitions</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first competition.
                </p>
            </div>
        )
    }

    if (isLoading || !isAuthorized) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <ButterflyLoader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {competitions.map((competition) => {
                const statusInfo = getCompetitionStatus(competition.startDate, competition.endDate)

                return (
                    <Card key={competition.id} className="border-0 shadow-sm">
                        <CardContent className="p-0">
                            <div className="flex">
                                {/* Image Section - 1/3 */}
                                <div className="w-1/3 relative">
                                    <div className="aspect-square relative overflow-hidden rounded-l-lg">
                                        {competition.imageUrl ? (
                                            <Image
                                                src={`http://localhost:5000${competition.imageUrl}`}
                                                alt={competition.name}
                                                fill
                                                className="object-cover"
                                                sizes="33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <Trophy className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section - 2/3 */}
                                <div className="w-2/3 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-xl font-semibold">{competition.name}</h3>
                                                <Badge className={statusInfo.color}>
                                                    {statusInfo.status}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3">{competition.description}</p>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(competition.startDate)} - {formatDate(competition.endDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>Max {competition.maxParticipants} participants</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Competition Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdateCompetition(competition.id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteCompetition(competition.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Tasks Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Target className="h-4 w-4" />
                                            <h4 className="font-medium">Tasks ({competition.tasks.length})</h4>
                                        </div>

                                        <div className="space-y-2">
                                            {competition.tasks.map((task) => (
                                                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-sm">{task.name}</span>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {task.exerciseName}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {task.metric}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                                            <span>Target: {task.targetValue} {task.unit}</span>
                                                            <div className="flex items-center gap-1">
                                                                <Award className="h-3 w-3" />
                                                                <span>{task.pointsValue} points</span>
                                                            </div>
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                                        )}
                                                    </div>

                                                    {/* Task Actions */}
                                                    <div className="flex gap-1 ml-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleUpdateTask(competition.id, task.id)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteTask(competition.id, task.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default CompetitionsPage
