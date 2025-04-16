"use client";
import React, { useEffect, useState } from 'react'
import { AddCompletedTaskSheet } from '@/components/add-completed-task-sheet';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { Calendar, Clock, Dumbbell } from 'lucide-react';

interface CompletedWorkout {
  id: number;
  title: string;
  completedDate: string;
  completedTime: string | null;
  actualDuration: number | null;
  createdAt: string;
  actualExercises: {  // Changed from exercises to actualExercises
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

const CompletedWorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedWorkouts();
  }, []);

  const fetchCompletedWorkouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch('http://localhost:5000/api/actual-workouts', {
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
  }

  const handleAddCompletedTasks = async () => {
    await fetchCompletedWorkouts();
  }

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

  const renderWorkouts = (workouts: CompletedWorkout[]) => {
    const sortedWorkouts = [...workouts].sort((a, b) =>
      new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
    );
  
    return sortedWorkouts.map(workout => (
      <li key={workout.id} className="px-4 py-3 rounded-lg border shadow-sm">
        <div className='flex justify-between items-start'>
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
      <AddCompletedTaskSheet propAddCompletedTasks={handleAddCompletedTasks} />

      <div className="mt-8 max-w mx-auto px-20">
        <h2 className="text-xl font-semibold mb-4">Your Completed Workouts</h2>

        <div className="space-y-8">
          {groupedWorkouts.today.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Today</SidebarGroupLabel>
              <ul className="space-y-3">
                {renderWorkouts(groupedWorkouts.today)}
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
              <SidebarGroupLabel>Older Workouts</SidebarGroupLabel>
              <ul className="space-y-3">
                {renderWorkouts(groupedWorkouts.past)}
              </ul>
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
}

export default CompletedWorkoutsPage;