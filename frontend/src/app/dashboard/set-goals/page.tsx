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
            toast.error("Failed to load workouts");
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
            toast.error("Failed to delete workout");
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
            toast.error("Failed to update workout");
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
            toast.error(error instanceof Error ? error.message : "Failed to mark workout as completed");
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
        return workouts.map(workout => (
            <li key={workout.id} className="px-4 py-3 rounded-lg border shadow-sm">
                <div className="flex flex-col">
                    <div className="flex justify-between items-start">
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
                    <div className="flex justify-end gap-3 mt-3">
                        <button
                            onClick={() => markAsCompleted(workout)}
                            className="p-2 text-gray-600 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedWorkout(workout);
                                setEditDialogOpen(true);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleDeleteGoal(workout.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </li>
        ));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                        <p className="text-center text-gray-500">
                            No workouts planned yet. Add your first workout!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetGoalPage;