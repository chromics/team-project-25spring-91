//page.tsx 
"use client";
import { SheetDemo } from '@/components/add-goal-sheet'
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Calendar, CheckCircle, Clock, Dumbbell, Edit, Trash2 } from 'lucide-react';
import { EditWorkoutDialog } from '@/components/edit-workouts-dialog';

interface PlannedWorkout {
    id: number;
    title: string;
    scheduledDate: string;
    estimatedDuration: number;
    reminderSent: boolean;
    plannedExercises: {
        id: number;
        exercise: {
            name: string;
            category: string;
        };
        plannedSets: number | null;
        plannedReps: number | null;
        plannedDuration: number | null;
    }[];
}

interface Goal {
    date: string;
    calories: number;
    title: string;
}

const SetGoalPage = () => {
    const [workouts, setWorkouts] = useState<PlannedWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout | null>(null);

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth-token');

            const response = await fetch(`http://localhost:5000/api/planned-workouts`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch workouts');

            const data = await response.json();
            setWorkouts(data.data);
        } catch (error) {
            toast.error("Failed to load workouts");
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (newGoal: Goal) => {
        await fetchWorkouts(); // Refresh the workouts after adding a new one
    }

    const handleDeleteGoal = async (id: number) => {
        setLoading(true);
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const token = localStorage.getItem('auth-token');
                const response = await fetch(`http://localhost:5000/api/planned-workouts/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const responseText = await response.text();
                    throw new Error(`Failed to delete workout: ${response.status} ${responseText}`);
                }

                await fetchWorkouts();
                toast.success('Workout deleted successfully');
                break; // Exit loop on success

            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    toast.error("Failed to delete workout after multiple attempts");
                    console.error(error);
                } else {

                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        setLoading(false);
    }

    const handleEditGoal = async (workout: PlannedWorkout) => {
        setLoading(true);
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const token = localStorage.getItem('auth-token');
                const response = await fetch(`http://localhost:5000/api/planned-workouts/${workout.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: workout.title,
                        scheduledDate: workout.scheduledDate,
                        estimatedDuration: workout.estimatedDuration,
                        plannedExercises: workout.plannedExercises
                    })
                });

                if (!response.ok) {
                    const responseText = await response.text();
                    throw new Error(`Failed to edit workout: ${response.status} ${responseText}`);
                }

                await fetchWorkouts();
                toast.success('Workout updated successfully');
                break;

            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    toast.error("Failed to update workout after multiple attempts");
                    console.error(error);
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        setLoading(false);
    };

    const markAsCompleted = async (workout: PlannedWorkout) => {
        setLoading(true);
        const maxRetries = 3;
        let retryCount = 0;


            try {
                const token = localStorage.getItem('auth-token');


                //if the user check the plan as completed, the plan is sent to completed tasks
                const response = await fetch(`http://localhost:5000/api/actual-workouts/from-planned/${workout.id}`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      title: workout.title,
                      completedDate: workout.scheduledDate,
                      actualDuration: workout.estimatedDuration,
                      actualExercises: workout.plannedExercises
                    })
                  });

                if (!response.ok) {
                    const responseText = await response.text();
                    const data = JSON.parse(responseText);
                    const message = data.message || data.error || data;
                    toast.error(message);

                    throw new Error(`Failed to edit workout: ${response.status} ${responseText}`);
                }
                // await handleDeleteGoal(workout.id); // no need to delete..

                await fetchWorkouts();
                toast.success('Workout updated successfully');


            } catch (error) {

                if (retryCount === maxRetries) {
                    toast.error("Failed to update workout");
                    console.error(error);
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

        setLoading(false);
    }

    const groupWorkouts = (workouts: PlannedWorkout[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        return {
            future: workouts.filter(workout => {
                const workoutDate = new Date(workout.scheduledDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() > today.getTime();
            }),
            today: workouts.filter(workout => {
                const workoutDate = new Date(workout.scheduledDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() === today.getTime();
            }),
            lastWeek: workouts.filter(workout => {
                const workoutDate = new Date(workout.scheduledDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() < today.getTime() &&
                    workoutDate.getTime() >= sevenDaysAgo.getTime();
            }),
            past: workouts.filter(workout => {
                const workoutDate = new Date(workout.scheduledDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() < sevenDaysAgo.getTime();
            })
        };
    };

    const renderWorkouts = (workouts: PlannedWorkout[]) => {
        const sortedWorkouts = [...workouts].sort((a, b) =>
            new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        );

        return sortedWorkouts.map(workout => (
            <li key={workout.id} className="px-4 py-3 rounded-lg border shadow-sm">
                <div className='flex flex-col'>
                    <div className='flex justify-between items-start'>
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg">{workout.title}</h3>
                            <div className="flex items-center text-gray-600 text-sm">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{new Date(workout.scheduledDate).toLocaleDateString()}</span>
                                <Clock className="w-4 h-4 ml-3 mr-1" />
                                <span>{workout.estimatedDuration} min</span>
                            </div>

                            <div className="space-y-1">
                                {workout.plannedExercises.map((exercise) => (
                                    <div key={exercise.id} className="flex items-center text-sm text-gray-700">
                                        <Dumbbell className="w-3 h-3 mr-1" />
                                        <span>{exercise.exercise.name}</span>
                                        {exercise.plannedSets && exercise.plannedReps && (
                                            <span className="ml-2">
                                                ({exercise.plannedSets} × {exercise.plannedReps})
                                            </span>
                                        )}
                                        {exercise.plannedDuration && (
                                            <span className="ml-2">({exercise.plannedDuration} min)</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="inline-flex items-center h-5 px-2 text-[10px] rounded-full border border-green-500 text-green-600 bg-green-50">
                            Planned
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => markAsCompleted(workout)}
                            className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => {
                            setSelectedWorkout(workout);
                            setEditDialogOpen(true);
                        }}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteGoal(workout.id)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </li>
        ));
    };

    const groupedWorkouts = groupWorkouts(workouts);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div>
            <EditWorkoutDialog
                workout={selectedWorkout}
                isOpen={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSave={handleEditGoal}
            />
            <SheetDemo propAddGoal={handleAddGoal} />

            <div className="mt-8 max-w mx-auto px-20">
                <h2 className="text-xl font-semibold mb-4">Your Planned Workouts</h2>

                <div className="space-y-8">
                    {groupedWorkouts.today.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Today</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {renderWorkouts(groupedWorkouts.today)}
                            </ul>
                        </SidebarGroup>
                    )}

                    {groupedWorkouts.future.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Upcoming Workouts</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {renderWorkouts(groupedWorkouts.future)}
                            </ul>
                        </SidebarGroup>
                    )}

                    {groupedWorkouts.lastWeek.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {renderWorkouts(groupedWorkouts.lastWeek)}
                            </ul>
                        </SidebarGroup>
                    )}

                    {groupedWorkouts.past.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Past Workouts</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {renderWorkouts(groupedWorkouts.past)}
                            </ul>
                        </SidebarGroup>
                    )}

                    {workouts.length === 0 && (
                        <p className="text-center text-gray-500">
                            No workouts planned yet. Add your first workout!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SetGoalPage;