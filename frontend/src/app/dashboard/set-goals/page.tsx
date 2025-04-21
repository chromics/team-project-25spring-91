"use client";
import { SheetDemo } from '@/components/add-goal-sheet';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, CheckCircle, Clock, Dumbbell, Edit, Trash2 } from 'lucide-react';
import { EditWorkoutDialog } from '@/components/edit-workouts-dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import api from '@/utils/api';
import ButterflyLoader from '@/components/butterfly-loader';
import axios from 'axios';
import { Button } from '@/components/ui/button';

interface PlannedExercise {
    id: number;
    exercise: {
        name: string;
        category: string;
    };
    plannedSets: number | null;
    plannedReps: number | null;
    plannedDuration: number | null;
}

interface PlannedWorkout {
    id: number;
    title: string;
    scheduledDate: string;
    estimatedDuration: number;
    reminderSent: boolean;
    plannedExercises: PlannedExercise[];
}

interface Goal {
    date: string;
    calories: number;
    title: string;
}

interface WorkoutGroup {
    future: PlannedWorkout[];
    today: PlannedWorkout[];
    lastWeek: PlannedWorkout[];
    past: PlannedWorkout[];
}

const ITEMS_PER_PAGE = 10;

const SetGoalPage = () => {
    const [workouts, setWorkouts] = useState<PlannedWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout | null>(null);
    const [currentPages, setCurrentPages] = useState({
        future: 1,
        lastWeek: 1,
        past: 1
    });
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            // const token = localStorage.getItem('auth-token');
            // const response = await fetch('http://localhost:5000/api/planned-workouts', {
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });

            // if (!response.ok) throw new Error('Failed to fetch workouts');
            // const data = await response.json();
            const { data } = await api.get('/planned-workouts');
            setWorkouts(data.data);
        } catch (error) {

            let errorMessage = 'Failed to load workouts';

            if (axios.isAxiosError(error) && error.response && error.response.data) {

                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (newGoal: Goal) => {
        await fetchWorkouts();
    };

    const handleDeleteGoal = async (id: number) => {
        try {
            setLoading(true);
            // const token = localStorage.getItem('auth-token');
            // const response = await fetch(`http://localhost:5000/api/planned-workouts/${id}`, {
            //     method: 'DELETE',
            //     headers: { 'Authorization': `Bearer ${token}` }
            // });

            // if (!response.ok) throw new Error('Failed to delete workout');
            await api.delete(`/planned-workouts/${id}`);
            await fetchWorkouts();
            toast.success('Workout deleted successfully');
        } catch (error) {
            let errorMessage = 'Failed to delete workout';

            if (axios.isAxiosError(error) && error.response && error.response.data) {

                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEditGoal = async (workout: PlannedWorkout) => {
        try {
            setLoading(true);
            // const token = localStorage.getItem('auth-token');
            // const response = await fetch(`http://localhost:5000/api/planned-workouts/${workout.id}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         title: workout.title,
            //         scheduledDate: workout.scheduledDate,
            //         estimatedDuration: workout.estimatedDuration,
            //         plannedExercises: workout.plannedExercises
            //     })
            // });

            // if (!response.ok) throw new Error('Failed to update workout');

            const updatedData = {
                title: workout.title,
                scheduledDate: workout.scheduledDate,
                estimatedDuration: workout.estimatedDuration,
                plannedExercises: workout.plannedExercises
            }
            await api.put(`/planned-workouts/${workout.id}`, updatedData);
            await fetchWorkouts();
            toast.success('Workout updated successfully');
        } catch (error) {
            // console.error('Error marking workout:', error); 

            let errorMessage = 'Failed to update workout';

            if (axios.isAxiosError(error) && error.response && error.response.data) {

                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const markAsCompleted = async (workout: PlannedWorkout) => {
        try {
            setLoading(true);
            // const token = localStorage.getItem('auth-token');
            // const response = await fetch(`http://localhost:5000/api/actual-workouts/from-planned/${workout.id}`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         title: workout.title,
            //         completedDate: workout.scheduledDate,
            //         actualDuration: workout.estimatedDuration,
            //         actualExercises: workout.plannedExercises
            //     })
            // });

            // if (!response.ok) {
            //     const data = await response.json();
            //     throw new Error(data.message || 'Failed to mark workout as completed');
            // }
            const updatedData = {
                title: workout.title,
                completedDate: workout.scheduledDate,
                actualDuration: workout.estimatedDuration,
                actualExercises: workout.plannedExercises
            }
            await api.post(`/actual-workouts/from-planned/${workout.id}`, updatedData);
            await fetchWorkouts();
            toast.success('Workout marked as completed');
        } catch (error) {
            // console.error('Error marking workout:', error); 

            let errorMessage = 'Failed to mark workout as completed';

            if (axios.isAxiosError(error) && error.response && error.response.data) {

                errorMessage = error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const groupWorkouts = (workouts: PlannedWorkout[]): WorkoutGroup => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const groups = {
            future: [] as PlannedWorkout[],
            today: [] as PlannedWorkout[],
            lastWeek: [] as PlannedWorkout[],
            past: [] as PlannedWorkout[]
        };

        workouts.forEach(workout => {
            const workoutDate = new Date(workout.scheduledDate);
            workoutDate.setHours(0, 0, 0, 0);

            if (workoutDate.getTime() === today.getTime()) {
                groups.today.push(workout);
            } else if (workoutDate.getTime() > today.getTime()) {
                groups.future.push(workout);
            } else if (workoutDate.getTime() >= sevenDaysAgo.getTime()) {
                groups.lastWeek.push(workout);
            } else {
                groups.past.push(workout);
            }
        });

        return groups;
    };


    /**
     * AI generated code 
     * tool: chat-gpt 
     * version: o3 mini high
     * usage: actually the pagination is from a library called ShadCN, but i want it to render the page properly, like 10 items per page    
     */
    const paginateWorkouts = (workouts: PlannedWorkout[], page: number) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return workouts.slice(start, start + ITEMS_PER_PAGE);
    };

    const renderPagination = (total: number, currentPage: number, section: keyof typeof currentPages) => {
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        const renderPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5; // Show max 5 page numbers at a time

            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisiblePages - 1);

            // Adjust start if we're near the end
            if (end === totalPages) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }

            // Add first page
            if (start > 1) {
                pages.push(
                    <PaginationItem key="1">
                        <PaginationLink
                            onClick={() => setCurrentPages(prev => ({ ...prev, [section]: 1 }))}
                            className="cursor-pointer"
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>
                );
                if (start > 2) {
                    pages.push(
                        <PaginationItem key="ellipsis1">
                            <PaginationEllipsis />
                        </PaginationItem>
                    );
                }
            }

            // Add visible page numbers
            for (let i = start; i <= end; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            isActive={currentPage === i}
                            onClick={() => setCurrentPages(prev => ({ ...prev, [section]: i }))}
                            className="cursor-pointer"
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            // Add last page
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push(
                        <PaginationItem key="ellipsis2">
                            <PaginationEllipsis />
                        </PaginationItem>
                    );
                }
                pages.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink
                            onClick={() => setCurrentPages(prev => ({ ...prev, [section]: totalPages }))}
                            className="cursor-pointer"
                        >
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            return pages;
        };

        return (
            <Pagination className="mt-4">
                <PaginationContent className="flex flex-wrap gap-1">
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setCurrentPages(prev => ({
                                ...prev,
                                [section]: Math.max(1, prev[section] - 1)
                            }))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {renderPageNumbers()}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setCurrentPages(prev => ({
                                ...prev,
                                [section]: Math.min(totalPages, prev[section] + 1)
                            }))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    const renderWorkoutList = (workouts: PlannedWorkout[]) => {
        return workouts.map(workout => {
            const exercisesToShow = isExpanded ? workout.plannedExercises : workout.plannedExercises.slice(0, 1);

            return (
                <li key={workout.id} className="bg-card text-card-foreground px-4 py-3 rounded-lg border border-border/60 hover:border-border/80 transition-colors">
                    <div className="flex flex-col">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg">{workout.title}</h3>
                            <div className="flex items-center gap-2">
                                <div className="inline-flex items-center h-5 px-2 text-[10px] rounded-full border border-[#C5D8E5] text-[#8BA6B9] bg-[#F8FAFF]">
                                    Planned
                                </div>
                                <div className="flex items-center gap-1"> {/* items-center helps vertically align */}
                                    {/* Mark as Completed Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => markAsCompleted(workout)}
                                        aria-label="Mark as completed"
                                        className="cursor-pointer"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </Button>

                                    {/* Edit Button - Changed size to "sm" */}
                                    <Button
                                        variant="ghost"
                                        size="sm" // Use "sm" or "default" instead of "icon"
                                        onClick={() => {
                                            setSelectedWorkout(workout);
                                            setEditDialogOpen(true);
                                        }}
                                        // aria-label is less critical now text is visible, but good practice
                                        aria-label="Edit workout"
                                        className="cursor-pointer"
                                    >
                                        {/* Add margin-left to the icon for spacing */}
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Workout
                                    </Button>

                                    {/* Delete Button */}
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDeleteGoal(workout.id)}
                                        aria-label="Delete workout"
                                        className="cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm mt-2">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            <span>{new Date(workout.scheduledDate).toLocaleDateString()}</span>
                            <Clock className="w-3.5 h-3.5 ml-3 mr-1" />
                            <span>{workout.estimatedDuration} min</span>
                        </div>
                        <div className="space-y-0.5 mt-2">
                            {exercisesToShow.map((exercise) => (
                                <div key={exercise.id} className="flex items-center text-sm text-muted-foreground">
                                    <Dumbbell className="w-3 h-3 mr-1 text-muted-foreground/70" />
                                    <span>{exercise.exercise.name}</span>
                                    {exercise.plannedSets && exercise.plannedReps && (
                                        <span className="ml-2 text-muted-foreground/80">
                                            ({exercise.plannedSets} × {exercise.plannedReps})
                                        </span>
                                    )}
                                    {exercise.plannedDuration && (
                                        <span className="ml-2 text-muted-foreground/80">({exercise.plannedDuration} min)</span>
                                    )}
                                </div>
                            ))}
                            {workout.plannedExercises.length > 1 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-sm text-primary hover:underline focus:outline-none mt-1"
                                >
                                    {isExpanded
                                        ? 'Show less'
                                        : `+${workout.plannedExercises.length - 1} more exercises`
                                    }
                                </button>
                            )}
                        </div>
                    </div>
                </li>


            );
        });
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <ButterflyLoader />
            </div>
        );
    }

    const groupedWorkouts = groupWorkouts(workouts);

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
                                {renderWorkoutList(groupedWorkouts.today)}
                            </ul>
                        </SidebarGroup>
                    )}

                    {groupedWorkouts.future.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Upcoming Workouts</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {renderWorkoutList(paginateWorkouts(groupedWorkouts.future, currentPages.future))}
                            </ul>
                            {renderPagination(groupedWorkouts.future.length, currentPages.future, 'future')}
                        </SidebarGroup>
                    )}

                    {groupedWorkouts.lastWeek.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {renderWorkoutList(paginateWorkouts(groupedWorkouts.lastWeek, currentPages.lastWeek))}
                            </ul>
                            {renderPagination(groupedWorkouts.lastWeek.length, currentPages.lastWeek, 'lastWeek')}
                        </SidebarGroup>
                    )}

                    {groupedWorkouts.past.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Past Workouts</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {renderWorkoutList(paginateWorkouts(groupedWorkouts.past, currentPages.past))}
                            </ul>
                            {renderPagination(groupedWorkouts.past.length, currentPages.past, 'past')}
                        </SidebarGroup>
                    )}

                    {workouts.length === 0 && (
                        <p className="text-center text-muted-foreground">
                            No workouts planned yet. Add your first workout!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetGoalPage;