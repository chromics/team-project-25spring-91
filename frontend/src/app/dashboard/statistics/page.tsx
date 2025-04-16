"use client";
import { AnnualLineChart } from '@/components/line-chart';
import AnnualBarChart from '@/components/bar-chart';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

interface WorkoutStats {
    completedWorkoutSessions: number;
    currentMonthCompletionRate: number;
    workoutsByYear: YearlyWorkouts[];
    monthlyCompletedWorkouts: MonthlyWorkout[];
    longestStreak: number;
    currentStreak: number;
    bestRecords: {
        heaviestWeight: {
            weight: string;
            exercise: {
                id: number;
                name: string;
            }
        };
        mostReps: {
            reps: number;
            exercise: {
                id: number;
                name: string;
            }
        };
        mostSets: {
            sets: number;
            exercise: {
                id: number;
                name: string;
            }
        };
    };
    volumeByYear: YearlyVolume[];
    monthlyVolume: MonthlyVolume[];
    topExercises: TopExercise[];
}

interface YearlyWorkouts {
    year: number;
    months: MonthlyWorkout[];
}

interface MonthlyWorkout {
    month: number;
    monthName: string;
    count: number;
}

interface YearlyVolume {
    year: number;
    months: MonthlyVolume[];
}

interface MonthlyVolume {
    month: number;
    monthName: string;
    volume: number;
}

interface TopExercise {
    id: number;
    name: string;
    category: string;
    count: number;
}

const StatsPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<WorkoutStats | null>(null);
    
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth-token');
            const response = await fetch('http://localhost:5000/api/statistics/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch statistics');

            const data = await response.json();
            setStats(data.data);
        } catch (error) {
            toast.error("Failed to load statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Prepare the data for components
    const records = {
        heaviestLift: {
            name: stats?.bestRecords?.heaviestWeight?.exercise?.name || "No data",
            value: parseFloat(stats?.bestRecords?.heaviestWeight?.weight || "0"),
            unit: "kg",
            description: "Heaviest lift",
        },
        mostReps: {
            name: stats?.bestRecords?.mostReps?.exercise?.name || "No data",
            value: stats?.bestRecords?.mostReps?.reps || 0,
            unit: "rep",
            unitPlural: "reps",
            description: "Most reps",
        },
        longestStreak: {
            value: stats?.longestStreak || 0,
            unit: "day",
            unitPlural: "days",
            description: "Longest streak",
        },
        currentStreak: {
            value: stats?.currentStreak || 0,
            unit: "day",
            unitPlural: "days",
            description: "Current streak",
        },
        TotalCompletion: {
            value: stats?.completedWorkoutSessions || 0,
            unit: "Workout",
            unitPlural: "Workouts",
            description: "Total completion",
        },
        CompletionRate: {
            value: Math.round(stats?.currentMonthCompletionRate || 0),
            unit: "%",
            description: "Completion rate (Last 30 days)"
        },
        TopMostFrequentExercise: {
            name: stats?.topExercises?.[0]?.name || "No data",
            value: stats?.topExercises?.[0]?.count || 0,
            unit: "Time",
            unitPlural: "Times",
            description: "1st",
        },
        SecondMostFrequentExercise: {
            name: stats?.topExercises?.[1]?.name || "No data",
            value: stats?.topExercises?.[1]?.count || 0,
            unit: "Time",
            unitPlural: "Times",
            description: "2nd",
        },
        ThirdMostFrequentExercise: {
            name: stats?.topExercises?.[2]?.name || "No data",
            value: stats?.topExercises?.[2]?.count || 0,
            unit: "Time",
            unitPlural: "Times",
            description: "3rd",
        }
    };

    // Pass the data to chart components if needed
    const monthlyWorkoutData = stats?.monthlyCompletedWorkouts || [];
    const volumeData = stats?.monthlyVolume || [];

    return (
        <>
            {/* 
                Streaks and Completion Rate and Count
            */}
            <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-4xl m-auto text-center">
                
                <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-4">
                    {/* Longest Streak */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
                            {records.longestStreak.value}
                            <span className="text-lg sm:text-xl text-primary/80 ml-1">
                            {records.longestStreak.value > 1
                                ? records.longestStreak.unitPlural
                                : records.longestStreak.unit}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.longestStreak.description}
                        </div>
                    </div>

                    {/* Divider - Only shown on larger screens */}
                    <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>

                    {/* Horizontal divider for mobile */}
                    <div className="w-1/2 h-px bg-border sm:hidden"></div>

                    {/* Current Streak */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
                            {records.currentStreak.value}
                            <span className="text-lg sm:text-xl text-primary/80 ml-1">
                                {records.currentStreak.value > 1
                                    ? records.currentStreak.unitPlural
                                    : records.currentStreak.unit}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.currentStreak.description}
                        </div>
                    </div>

                    {/* Divider - Only shown on larger screens */}
                    <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>

                    {/* Horizontal divider for mobile */}
                    <div className="w-1/2 h-px bg-border sm:hidden"></div>

                    {/* Total Completion */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
                            {records.TotalCompletion.value}
                            <span className="text-lg sm:text-xl text-primary/80 ml-1">
                                {records.TotalCompletion.value > 1
                                    ? records.TotalCompletion.unitPlural
                                    : records.TotalCompletion.unit}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.TotalCompletion.description}
                        </div>
                    </div>

                    {/* Divider - Only shown on larger screens */}
                    <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>

                    {/* Horizontal divider for mobile */}
                    <div className="w-1/2 h-px bg-border sm:hidden"></div>

                    {/* Completion Rate */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
                            {records.CompletionRate.value}
                            <span className="text-lg sm:text-xl text-primary/80 ml-1">
                                {records.CompletionRate.unit}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.CompletionRate.description}
                        </div>
                    </div>
                </div>
            </div>

            {/* 
                BarChart displaying Total Workout Session Completed Per Month
            */}
            <div>
                <AnnualBarChart chartData={stats?.workoutsByYear || []} />
            </div>

            {/* 
                Best Records:
                - Heaviest Lift
                - Most Reps
            */}
            <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-4xl m-auto text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6">Best Records</h2>
                
                <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-4">
                    {/* Heaviest Lift */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="text-base sm:text-lg font-medium text-muted-foreground">
                            {records.heaviestLift.name}
                        </div>
                        <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
                            {records.heaviestLift.value}
                            <span className="text-lg sm:text-xl text-primary/80 ml-1">
                                {records.heaviestLift.unit}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.heaviestLift.description}
                        </div>
                    </div>

                    {/* Divider - Only shown on larger screens */}
                    <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>

                    {/* Horizontal divider for mobile */}
                    <div className="w-1/2 h-px bg-border sm:hidden"></div>

                    {/* Most Reps */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="text-base sm:text-lg font-medium text-muted-foreground">
                            {records.mostReps.name}
                        </div>
                        <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
                            {records.mostReps.value}
                            <span className="text-lg sm:text-xl text-primary/80 ml-1">
                                {records.mostReps.unitPlural && records.mostReps.value > 1
                                        ? records.mostReps.unitPlural
                                        : records.mostReps.unit}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.mostReps.description}
                        </div>
                    </div>
                </div>
            </div>


            <div>
                <AnnualLineChart chartData={stats?.volumeByYear || []} />
            </div>
            
            {/* 
                Top 3 most frequent Exercises
            */}
            <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-4xl m-auto text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6">Top 3 Most Frequently Scheduled Exercises</h2>
                
                <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-4">
                    {/* Top 1 */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="text-2xl sm:text-3xl font-medium text-primary/80">
                            {records.TopMostFrequentExercise.name}
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.TopMostFrequentExercise.value}

                            <span className="text-muted-foreground/80 ml-1">
                            {records.TopMostFrequentExercise.unitPlural && records.TopMostFrequentExercise.value > 1
                                ? records.TopMostFrequentExercise.unitPlural
                                : records.TopMostFrequentExercise.unit}
                            </span>
                        </div>
                    </div>

                    {/* Divider - Only shown on larger screens */}
                    <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>

                    {/* Horizontal divider for mobile */}
                    <div className="w-1/2 h-px bg-border sm:hidden"></div>

                    {/* Top 2 */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="text-2xl sm:text-3xl font-medium text-primary/80">
                            {records.SecondMostFrequentExercise.name}
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.SecondMostFrequentExercise.value}

                            <span className="text-muted-foreground/80 ml-1">
                            {records.SecondMostFrequentExercise.unitPlural && records.SecondMostFrequentExercise.value > 1
                                ? records.SecondMostFrequentExercise.unitPlural
                                : records.SecondMostFrequentExercise.unit}
                            </span>
                        </div>
                    </div>
                    
                    {/* Divider - Only shown on larger screens */}
                    <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>

                    {/* Horizontal divider for mobile */}
                    <div className="w-1/2 h-px bg-border sm:hidden"></div>

                    {/* Top 3 */}
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                        <div className="text-2xl sm:text-3xl font-medium text-primary/80">
                            {records.ThirdMostFrequentExercise.name}
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {records.ThirdMostFrequentExercise.value}

                            <span className="text-muted-foreground/80 ml-1">
                            {records.ThirdMostFrequentExercise.unitPlural && records.ThirdMostFrequentExercise.value > 1
                                ? records.ThirdMostFrequentExercise.unitPlural
                                : records.ThirdMostFrequentExercise.unit}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StatsPage;