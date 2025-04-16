"use client";
import React, { useEffect, useState } from 'react'
import { AddCompletedTaskSheet } from '@/components/add-completed-task-sheet';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { Calendar, Clock, Dumbbell, Edit, Trash2 } from 'lucide-react';
import { EditCompletedWorkoutDialog } from '@/components/edit-completed-workouts-dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface CompletedWorkout {
    id: number;
    title: string;
    completedDate: string;
    completedTime: string | null;
    actualDuration: number | null;
    createdAt: string;
    actualExercises: {
        id: number;
        actualId: number;
        exerciseId: number;
        plannedExerciseId: null;
        actualSets: number | null;
        actualReps: number | null;
        actualWeight: number | null;
        actualDuration: number | null;
        exercise: {
            id: number;
            name: string;
            category: string;
            description: string;
            createdAt: string;
        };
        plannedExercise: null;
    }[];
    plannedWorkout: null;
}

const ITEMS_PER_PAGE = 10;

const CompletedWorkoutsPage = () => {
    const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<CompletedWorkout | null>(null);
    const [currentPages, setCurrentPages] = useState({
        lastWeek: 1,
        past: 1
    });

    useEffect(() => {
        fetchCompletedWorkouts();
    }, []);

    const fetchCompletedWorkouts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth-token');
            const response = await fetch('http://localhost:5000/api/actual-workouts', {
                headers: { 'Authorization': `Bearer ${token}` }
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

    const handleAddCompletedTasks = async () => {
        await fetchCompletedWorkouts();
    };

    const handleDeleteGoal = async (id: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth-token');
            const response = await fetch(`http://localhost:5000/api/actual-workouts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete workout');
            
            await fetchCompletedWorkouts();
            toast.success('Workout deleted successfully');
        } catch (error) {
            toast.error("Failed to delete workout");
        } finally {
            setLoading(false);
        }
    };

    const handleEditGoal = async (workout: CompletedWorkout) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth-token');
            const response = await fetch(`http://localhost:5000/api/actual-workouts/${workout.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: workout.title,
                    completedDate: workout.completedDate,
                    actualDuration: workout.actualDuration,
                    actualExercises: workout.actualExercises
                })
            });

            if (!response.ok) throw new Error('Failed to update workout');
            
            await fetchCompletedWorkouts();
            toast.success('Workout updated successfully');
        } catch (error) {
            toast.error("Failed to update workout");
        } finally {
            setLoading(false);
        }
    };

    const groupWorkouts = (workouts: CompletedWorkout[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        return {
            today: workouts.filter(workout => {
                const workoutDate = new Date(workout.completedDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() === today.getTime();
            }),
            lastWeek: workouts.filter(workout => {
                const workoutDate = new Date(workout.completedDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() < today.getTime() &&
                    workoutDate.getTime() >= sevenDaysAgo.getTime();
            }),
            past: workouts.filter(workout => {
                const workoutDate = new Date(workout.completedDate);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() < sevenDaysAgo.getTime();
            })
        };
    };

    const paginateWorkouts = (workouts: CompletedWorkout[], page: number) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return workouts.slice(start, start + ITEMS_PER_PAGE);
    };

    const renderPagination = (total: number, currentPage: number, section: keyof typeof currentPages) => {
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        const renderPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;
            
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisiblePages - 1);
            
            if (end === totalPages) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }

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

    const renderWorkout = (workout: CompletedWorkout) => (
        <li key={workout.id} className="px-4 py-3 rounded-lg border shadow-sm">
            <div className="flex flex-col">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg">{workout.title}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(workout.completedDate).toLocaleDateString()}</span>
                            {workout.actualDuration && (
                                <>
                                    <Clock className="w-4 h-4 ml-3 mr-1" />
                                    <span>{workout.actualDuration} min</span>
                                </>
                            )}
                        </div>
                        <div className="space-y-1">
                            {workout.actualExercises.map((exercise) => (
                                <div key={exercise.id} className="flex items-center text-sm text-gray-700">
                                    <Dumbbell className="w-3 h-3 mr-1" />
                                    <span>{exercise.exercise.name}</span>
                                    {exercise.actualSets && exercise.actualReps && (
                                        <span className="ml-2">
                                            ({exercise.actualSets} × {exercise.actualReps})
                                        </span>
                                    )}
                                    {exercise.actualDuration && (
                                        <span className="ml-2">({exercise.actualDuration} min)</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="inline-flex items-center h-5 px-2 text-[10px] rounded-full border border-blue-500 text-blue-600 bg-blue-50">
                        Completed
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-3">
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
    );

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
            <EditCompletedWorkoutDialog
                workout={selectedWorkout}
                isOpen={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSave={handleEditGoal}
            />
            <AddCompletedTaskSheet propAddCompletedTasks={handleAddCompletedTasks} />

            <div className="mt-8 max-w mx-auto px-20">
                <h2 className="text-xl font-semibold mb-4">Your Completed Workouts</h2>

                <div className="space-y-8">
                    {groupedWorkouts.today.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Today</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {groupedWorkouts.today.map(renderWorkout)}
                            </ul>
                        </SidebarGroup>
                    )}

                    {groupedWorkouts.lastWeek.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {paginateWorkouts(groupedWorkouts.lastWeek, currentPages.lastWeek).map(renderWorkout)}
                            </ul>
                            {renderPagination(groupedWorkouts.lastWeek.length, currentPages.lastWeek, 'lastWeek')}
                        </SidebarGroup>
                    )}

                    {groupedWorkouts.past.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Past Workouts</SidebarGroupLabel>
                            <ul className="space-y-3">
                                {paginateWorkouts(groupedWorkouts.past, currentPages.past).map(renderWorkout)}
                            </ul>
                            {renderPagination(groupedWorkouts.past.length, currentPages.past, 'past')}
                        </SidebarGroup>
                    )}

                    {workouts.length === 0 && (
                        <p className="text-center text-gray-500">
                            No completed workouts yet. Complete your first workout!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompletedWorkoutsPage;