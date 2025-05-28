"use client"

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, X, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import ButterflyLoader from "@/components/butterfly-loader";

interface Challenge {
  id: string;
  title: string;
  endDate: string;
  daysLeft: number;
  progress: number;
  exercise?: string;
  metric?: string;
  target?: number;
  unit?: string;
  type: "official" | "personal";
  completed?: boolean;
  endDateTimestamp: number; // For sorting
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  completionTime?: string | null;
  progress: number;
  startDate?: string;
}

// Sample data for leaderboard
const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: "FitChampion", completionTime: "3d 4h", progress: 100 },
  { rank: 2, username: "RunnerPro", completionTime: "4d 2h", progress: 100 },
  { rank: 3, username: "FitnessGuru", completionTime: null, progress: 87 },
  { rank: 4, username: "SportsStar", completionTime: null, progress: 76 },
  { rank: 5, username: "WorkoutWarrior", completionTime: null, progress: 65 },
  { rank: 6, username: "HealthyHabits", completionTime: null, progress: 64 },
  { rank: 7, username: "StrengthMaster", completionTime: null, progress: 60 },
  { rank: 8, username: "EnduranceKing", completionTime: null, progress: 55 },
  { rank: 9, username: "PowerLifter", completionTime: null, progress: 52 },
  { rank: 10, username: "ActiveUser", completionTime: null, progress: 50 },
  { rank: 11, username: "FitnessFan", completionTime: null, progress: 48 },
  { rank: 12, username: "GymGoer", completionTime: null, progress: 45 },
  { rank: 13, username: "HealthTracker", completionTime: null, progress: 43 },
  { rank: 14, username: "WorkoutWizard", completionTime: null, progress: 40 },
  { rank: 15, username: "FitnessJourney", completionTime: null, progress: 38 },
];

// Table columns for leaderboard
const leaderboardColumns = [
  {
    accessorKey: "rank",
    header: "Rank",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "completionTime",
    header: "Completion Time",
    cell: ({ row }: any) => row.original.completionTime || "-",
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }: any) => `${row.original.progress}%`,
  },
];

const exercisesData = {
  "Weight": ["Bench Press", "Squats", "Deadlift", "Shoulder Press", "Lat Pulldown"],
  "Repetition": ["Bench Press", "Squats", "Deadlift", "Push-ups", "Pull-ups"],
  "Distance": ["Run", "Cycling", "Swimming", "Rowing"],
  "Duration": ["Run", "Cycling", "Swimming", "Plank", "Elliptical"]
};

const ChallengesPage: React.FC = () => {
  // Helper to create a timestamp from date string
  const getTimestampFromDateString = (dateStr: string): number => {
    try {
      const parts = dateStr.split(" ");
      const day = parseInt(parts[0]);
      const monthMap: Record<string, number> = {
        "jan": 0, "feb": 1, "mar": 2, "apr": 3, "may": 4, "jun": 5,
        "jul": 6, "aug": 7, "sep": 8, "oct": 9, "nov": 10, "dec": 11
      };
      const month = monthMap[parts[1].toLowerCase().substring(0, 3)];
      const year = parseInt(parts[2]);
      return new Date(year, month, day).getTime();
    } catch (e) {
      return Date.now(); // Fallback
    }
  };

  const [activeOfficialChallenges, setActiveOfficialChallenges] = useState<Challenge[]>([
    {
      id: "run-50km",
      title: "Run 50 km",
      endDate: "5 may 2025",
      daysLeft: 5,
      progress: 74,
      exercise: "Running",
      metric: "Distance",
      target: 50,
      unit: "km",
      type: "official",
      endDateTimestamp: getTimestampFromDateString("30 april 2025")
    },
    {
      id: "workout-sessions",
      title: "Complete 50 Workout Sessions",
      endDate: "11 may 2025",
      daysLeft: 11,
      progress: 21,
      exercise: "General",
      metric: "Sessions",
      target: 50,
      unit: "",
      type: "official",
      endDateTimestamp: getTimestampFromDateString("10 april 2025")
    },
  ]);

  const [activePersonalChallenges, setActivePersonalChallenges] = useState<Challenge[]>([
    {
      id: "bench-press",
      title: "Bench press 50 kg",
      endDate: "20 may 2025",
      daysLeft: 20,
      progress: 21,
      exercise: "Bench Press",
      metric: "Weight",
      target: 50,
      unit: "kg",
      type: "personal",
      endDateTimestamp: getTimestampFromDateString("9 november 2024")
    },
  ]);

  const [completedOfficialChallenges, setCompletedOfficialChallenges] = useState<Challenge[]>([
    {
      id: "run-30km",
      title: "Run 30 km",
      endDate: "15 march 2025",
      daysLeft: 0,
      progress: 100,
      exercise: "Running",
      metric: "Distance",
      target: 30,
      unit: "km",
      type: "official",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("15 march 2025")
    },
    {
      id: "swim-20km",
      title: "Swim 20 km",
      endDate: "1 february 2025",
      daysLeft: 0,
      progress: 100,
      exercise: "Swimming",
      metric: "Distance",
      target: 20,
      unit: "km",
      type: "official",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("1 february 2025")
    },
    {
      id: "bike-100km",
      title: "Bike 100 km",
      endDate: "10 january 2025",
      daysLeft: 0,
      progress: 100,
      exercise: "Cycling",
      metric: "Distance",
      target: 100,
      unit: "km",
      type: "official",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("10 january 2025")
    },
    {
      id: "pushups-1000",
      title: "Complete 1000 Push-ups",
      endDate: "25 december 2024",
      daysLeft: 0,
      progress: 100,
      exercise: "Push-ups",
      metric: "Count",
      target: 1000,
      unit: "",
      type: "official",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("25 december 2024")
    },
    {
      id: "plank-10min",
      title: "Plank for 10 minutes",
      endDate: "5 december 2024",
      daysLeft: 0,
      progress: 100,
      exercise: "Plank",
      metric: "Time",
      target: 10,
      unit: "min",
      type: "official",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("5 december 2024")
    },
    {
      id: "burpees-500",
      title: "Complete 500 Burpees",
      endDate: "1 november 2024",
      daysLeft: 0,
      progress: 70,
      exercise: "Burpees",
      metric: "Count",
      target: 500,
      unit: "",
      type: "official",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("1 november 2024")
    },
  ]);

  const { isAuthorized, isLoading, user } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER]
  });



  const [completedPersonalChallenges, setCompletedPersonalChallenges] = useState<Challenge[]>([
    {
      id: "deadlift-100kg",
      title: "Deadlift 100 kg",
      endDate: "20 march 2025",
      daysLeft: 0,
      progress: 100,
      exercise: "Deadlift",
      metric: "Weight",
      target: 100,
      unit: "kg",
      type: "personal",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("20 march 2025")
    },
    {
      id: "squat-80kg",
      title: "Squat 80 kg",
      endDate: "15 february 2025",
      daysLeft: 0,
      progress: 100,
      exercise: "Squat",
      metric: "Weight",
      target: 80,
      unit: "kg",
      type: "personal",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("15 february 2025")
    },
    {
      id: "pullups-20",
      title: "Do 20 Pull-ups",
      endDate: "10 january 2025",
      daysLeft: 0,
      progress: 100,
      exercise: "Pull-ups",
      metric: "Count",
      target: 20,
      unit: "",
      type: "personal",
      completed: true,
      endDateTimestamp: getTimestampFromDateString("10 january 2025")
    },
  ]);

  // Pagination state
  const [activeOfficialPage, setActiveOfficialPage] = useState(1);
  const [activePersonalPage, setActivePersonalPage] = useState(1);
  const [historyOfficialPage, setHistoryOfficialPage] = useState(1);
  const [historyPersonalPage, setHistoryPersonalPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<"progress" | "time">("progress");

  const ITEMS_PER_PAGE = 3;

  // Dialog state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewOfficialModalOpen, setViewOfficialModalOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  // Form state
  const [date, setDate] = useState<Date | undefined>();
  const [metric, setMetric] = useState<string>("Weight");
  const [exercise, setExercise] = useState<string>("Bench Press");
  const [target, setTarget] = useState<string>("50");
  const [unit, setUnit] = useState<string>("kg");

  // Sort challenges by end date
  const sortedActiveOfficialChallenges = [...activeOfficialChallenges].sort((a, b) =>
    a.endDateTimestamp - b.endDateTimestamp
  );

  const sortedActivePersonalChallenges = [...activePersonalChallenges].sort((a, b) =>
    a.endDateTimestamp - b.endDateTimestamp
  );

  const sortedCompletedOfficialChallenges = [...completedOfficialChallenges].sort((a, b) =>
    b.endDateTimestamp - a.endDateTimestamp // Reverse sort for completed challenges
  );

  const sortedCompletedPersonalChallenges = [...completedPersonalChallenges].sort((a, b) =>
    b.endDateTimestamp - a.endDateTimestamp // Reverse sort for completed challenges
  );
  const paginatedCompletedOfficialChallenges = sortedCompletedOfficialChallenges.slice(
    (historyOfficialPage - 1) * ITEMS_PER_PAGE,
    historyOfficialPage * ITEMS_PER_PAGE
  );

  const paginatedCompletedPersonalChallenges = sortedCompletedPersonalChallenges.slice(
    (historyPersonalPage - 1) * ITEMS_PER_PAGE,
    historyPersonalPage * ITEMS_PER_PAGE
  );

  // Calculate total pages
  const totalHistoryOfficialPages = Math.max(1, Math.ceil(sortedCompletedOfficialChallenges.length / ITEMS_PER_PAGE));
  const totalHistoryPersonalPages = Math.max(1, Math.ceil(sortedCompletedPersonalChallenges.length / ITEMS_PER_PAGE));

  const handleChallengeClick = (challenge: Challenge) => {
    setCurrentChallenge(challenge);

    if (challenge.type === "official") {
      setViewOfficialModalOpen(true);
    } else if (!challenge.completed) {
      // Only allow editing of active personal challenges
      try {
        const dateParts = challenge.endDate.split(" ");
        const day = parseInt(dateParts[0]);
        const monthMap: Record<string, number> = {
          "jan": 0, "feb": 1, "mar": 2, "apr": 3, "may": 4, "jun": 5,
          "jul": 6, "aug": 7, "sep": 8, "oct": 9, "nov": 10, "dec": 11
        };
        const month = monthMap[dateParts[1].toLowerCase().substring(0, 3)];
        const year = parseInt(dateParts[2]);

        setDate(new Date(year, month, day));
      } catch (e) {
        setDate(undefined);
      }

      setMetric(challenge.metric || "Weight");
      setExercise(challenge.exercise || "Bench Press");
      setTarget(challenge.target?.toString() || "50");
      setUnit(challenge.unit || "kg");

      setEditModalOpen(true);
    }
  };

  const handleCreateChallenge = () => {
    if (!date || !target) return;

    const endDateStr = format(date, "d MMM yyyy").toLowerCase();
    const daysLeft = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Helper function to handle singular/plural forms
    const getUnitText = (value: string | number, unit: string) => {
      const singularUnits: Record<string, string> = {
        "kg": "kg",
        "rep": "rep",
        "km": "km",
        "m": "m",
        "minute": "minute",
        "hour": "hour",
        "session": "workout"
      };

      const pluralUnits: Record<string, string> = {
        "kg": "kg",
        "rep": "reps",
        "km": "km",
        "m": "m",
        "minute": "minutes",
        "hour": "hours",
        "session": "workouts"
      };

      return parseInt(value.toString()) === 1 ? singularUnits[unit] : pluralUnits[unit];
    };

    // Generate title based on metric type
    let title: string;
    const targetValue = parseInt(target);
    const unitText = getUnitText(target, unit);

    if (metric === "Weight") {
      title = `${exercise} ${targetValue} ${unitText}`;
    } else if (metric === "Repetition") {
      title = `${exercise} ${targetValue} ${unitText}`;
    } else if (metric === "Duration") {
      title = `${exercise} for ${targetValue} ${unitText}`;
    } else if (metric === "Distance") {
      title = `${exercise} ${targetValue} ${unitText}`;
    } else if (metric === "Workout") {
      title = `Complete ${targetValue} ${unitText}`;
    } else {
      //Default case
      title = `${exercise} ${targetValue} ${unitText}`;
    }

    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);

    const newChallenge: Challenge = {
      id: `personal-${Date.now()}`,
      title: title,
      endDate: endDateStr,
      daysLeft: daysLeft,
      progress: 0,
      exercise,
      metric,
      target: targetValue,
      unit,
      type: "personal",
      endDateTimestamp: date.getTime()
    };

    setActivePersonalChallenges([...activePersonalChallenges, newChallenge]);
    setCreateModalOpen(false);
    resetForm();
  };

  const handleUpdateChallenge = () => {
    if (!currentChallenge || !date || !target) return;

    const endDateStr = format(date, "d MMM yyyy").toLowerCase();
    const daysLeft = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const updatedChallenge: Challenge = {
      ...currentChallenge,
      title: `${exercise} ${target} ${unit}`,
      endDate: endDateStr,
      daysLeft: daysLeft,
      exercise,
      metric,
      target: parseInt(target),
      unit,
      endDateTimestamp: date.getTime()
    };

    setActivePersonalChallenges(activePersonalChallenges.map(c =>
      c.id === currentChallenge.id ? updatedChallenge : c
    ));

    setEditModalOpen(false);
    resetForm();
  };

  const handleDeleteChallenge = () => {
    if (!currentChallenge) return;

    setActivePersonalChallenges(activePersonalChallenges.filter(c => c.id !== currentChallenge.id));
    setEditModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentChallenge(null);
    setDate(undefined);
    setMetric("Weight");
    setExercise("Bench Press");
    setTarget("50");
    setUnit("kg");
  };

  // Generate pagination items
  const generatePaginationItems = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
  ) => {
    // Create an array to hold pagination items
    const items = [];

    // Always add the previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) onPageChange(currentPage - 1);
          }}
          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    // Logic for page numbers
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if at the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page if needed
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Add ellipsis if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(i);
            }}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add last page if needed
    if (endPage < totalPages) {
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Always add the next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) onPageChange(currentPage + 1);
          }}
          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    return items;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-64">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="border rounded-md">
            <div className="p-4 mb-4">
              <h2 className="text-xl text-foreground mb-4">Official ({activeOfficialChallenges.length})</h2>

              <div className="space-y-4">
                {activeOfficialChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="border cursor-pointer hover:border-primary/50"
                    onClick={() => handleChallengeClick(challenge)}
                  >
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-medium text-foreground mb-1">{challenge.title}</h3>
                          <p className="text-muted-foreground">
                            Ends: {challenge.endDate} ({challenge.daysLeft} days left)
                          </p>
                        </div>
                        <div className="flex flex-col items-end w-40">
                          <span className="text-lg font-medium text-foreground mb-1">{challenge.progress}%</span>
                          <Progress value={challenge.progress} className="h-2 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {activeOfficialChallenges.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No official challenges available.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-xl text-foreground mb-4">Personal ({activePersonalChallenges.length}/10)</h2>

              <div className="space-y-4">
                {activePersonalChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="border cursor-pointer hover:border-primary/50"
                    onClick={() => handleChallengeClick(challenge)}
                  >
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-medium text-foreground mb-1">{challenge.title}</h3>
                          <p className="text-muted-foreground">
                            Ends: {challenge.endDate} ({challenge.daysLeft} days left)
                          </p>
                        </div>
                        <div className="flex flex-col items-end w-40">
                          <span className="text-lg font-medium text-foreground mb-1">{challenge.progress}%</span>
                          <Progress value={challenge.progress} className="h-2 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {activePersonalChallenges.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No personal challenges yet. Create one!
                  </div>
                )}
              </div>


            </div>

            <div className="flex justify-end mr-4 mb-4 mt-1">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 border-primary/30 text-foreground"
                onClick={() => {
                  resetForm();
                  setCreateModalOpen(true);
                }}
                disabled={activePersonalChallenges.length >= 10}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>


        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="border rounded-md">
            <div className="p-4">
              <h2 className="text-xl text-foreground mb-4">Official ({completedOfficialChallenges.length})</h2>

              <div className="space-y-4">
                {paginatedCompletedOfficialChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="border cursor-pointer hover:border-primary/50"
                    onClick={() => handleChallengeClick(challenge)}
                  >
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-medium text-foreground mb-1">{challenge.title}</h3>
                          <p className="text-muted-foreground">
                            Ends: {challenge.endDate}
                          </p>
                        </div>
                        <div className="flex flex-col items-end w-40">
                          <span className="text-lg font-medium text-foreground mb-1">{challenge.progress}%</span>
                          <Progress value={challenge.progress} className="h-2 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {completedOfficialChallenges.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed official challenges yet.
                  </div>
                )}
              </div>

              {totalHistoryOfficialPages >= 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    {generatePaginationItems(
                      historyOfficialPage,
                      totalHistoryOfficialPages,
                      setHistoryOfficialPage
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </div>

            <div className="p-4">
              <h2 className="text-xl text-foreground mb-4">Personal ({completedPersonalChallenges.length})</h2>

              <div className="space-y-4">
                {paginatedCompletedPersonalChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="border hover:border-primary/50"
                  >
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-medium text-foreground mb-1">{challenge.title}</h3>
                          <p className="text-muted-foreground">
                            Ends: {challenge.endDate}
                          </p>
                        </div>
                        <div className="flex flex-col items-end w-40">
                          <span className="text-lg font-medium text-foreground mb-1">{challenge.progress}%</span>
                          <Progress value={challenge.progress} className="h-2 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {completedPersonalChallenges.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed personal challenges yet.
                  </div>
                )}
              </div>

              {totalHistoryPersonalPages >= 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    {generatePaginationItems(
                      historyPersonalPage,
                      totalHistoryPersonalPages,
                      setHistoryPersonalPage
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Challenge Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-foreground text-2xl font-normal">Create Personal Challenge</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center">
              <label className="text-foreground text-xl w-1/3">End</label>
              <div className="w-2/3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => {
                        // Disable dates in the past
                        return date < new Date(new Date().setHours(0, 0, 0, 0));
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center">
              <label className="text-foreground text-xl w-1/3">Metric</label>
              <div className="w-2/3">
                <Select value={metric} onValueChange={(value: string) => {
                  const oldMetric = metric;
                  setMetric(value);

                  // Set default unit based on the selected metric
                  if (value === "Weight") {
                    setUnit("kg");
                  } else if (value === "Repetition") {
                    setUnit("rep");
                  } else if (value === "Distance") {
                    setUnit("km");
                  } else if (value === "Duration") {
                    setUnit("minute");
                  } else if (value === "Workout") {
                    setUnit("session");
                    // Reset exercise when metric is WorkoutSessions
                    setExercise("");
                    return;
                  }

                  // Check if current exercise is compatible with the new metric
                  const availableExercises = exercisesData[value as keyof typeof exercisesData] || [];
                  const isCurrentExerciseCompatible = availableExercises.includes(exercise);

                  if (!isCurrentExerciseCompatible) {
                    // Set default exercise for the new metric
                    if (availableExercises.length > 0) {
                      setExercise(availableExercises[0]);
                    } else {
                      setExercise(""); // Fallback if no exercises available
                    }
                  }
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weight">Weight</SelectItem>
                    <SelectItem value="Repetition">Repetition</SelectItem>
                    <SelectItem value="Distance">Distance</SelectItem>
                    <SelectItem value="Duration">Duration</SelectItem>
                    <SelectItem value="Workout">Workout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center">
              <label className={`text-foreground text-xl w-1/3 ${metric === "Workout" ? "opacity-50" : ""}`}>Exercise</label>
              <div className="w-2/3">
                <Select
                  value={exercise}
                  onValueChange={setExercise}
                  disabled={metric === "Workout"}
                >
                  <SelectTrigger className={metric === "Workout" ? "opacity-50 cursor-not-allowed" : ""}>
                    <SelectValue placeholder="Select Exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {metric !== "Workout" && (exercisesData[metric as keyof typeof exercisesData] || []).map((ex) => (
                      <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center">
              <label className="text-foreground text-xl w-1/3">Target</label>
              <div className="flex space-x-2 w-2/3">
                <Input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-1/3"
                />
                <div className="w-2/3">
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="w-30">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {metric === "Weight" && (
                        <SelectItem value="kg">kg</SelectItem>
                      )}
                      {metric === "Repetition" && (
                        <SelectItem value="rep">rep</SelectItem>
                      )}
                      {metric === "Distance" && (
                        <>
                          <SelectItem value="km">km</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                        </>
                      )}
                      {metric === "Duration" && (
                        <>
                          <SelectItem value="minute">minute</SelectItem>
                          <SelectItem value="hour">hour</SelectItem>
                        </>
                      )}
                      {metric === "Workout" && (
                        <>
                          <SelectItem value="session">session</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-background text-foreground border hover:bg-secondary/50"
                onClick={handleCreateChallenge}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Challenge Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-foreground text-2xl font-normal">
              Edit Personal Challenge
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center">
              <label className="text-foreground text-xl w-1/3">End</label>
              <div className="w-2/3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => {
                        // Disable dates in the past
                        return date < new Date(new Date().setHours(0, 0, 0, 0));
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center">
              <label className="text-foreground text-xl w-1/3">Metric</label>
              <div className="w-2/3">
                <Select value={metric} onValueChange={(value: string) => {
                  const oldMetric = metric;
                  setMetric(value);

                  // Set default unit based on the selected metric
                  if (value === "Weight") {
                    setUnit("kg");
                  } else if (value === "Repetition") {
                    setUnit("rep");
                  } else if (value === "Distance") {
                    setUnit("km");
                  } else if (value === "Duration") {
                    setUnit("minute");
                  } else if (value === "Workout") {
                    setUnit("session");
                    // Reset exercise when metric is WorkoutSessions
                    setExercise("");
                    return;
                  }

                  // Check if current exercise is compatible with the new metric
                  const availableExercises = exercisesData[value as keyof typeof exercisesData] || [];
                  const isCurrentExerciseCompatible = availableExercises.includes(exercise);

                  if (!isCurrentExerciseCompatible) {
                    // Set default exercise for the new metric
                    if (availableExercises.length > 0) {
                      setExercise(availableExercises[0]);
                    } else {
                      setExercise(""); // Fallback if no exercises available
                    }
                  }
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weight">Weight</SelectItem>
                    <SelectItem value="Repetition">Repetition</SelectItem>
                    <SelectItem value="Distance">Distance</SelectItem>
                    <SelectItem value="Duration">Duration</SelectItem>
                    <SelectItem value="Workout">Workout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center">
              <label className={`text-foreground text-xl w-1/3 ${metric === "Workout" ? "opacity-50" : ""}`}>Exercise</label>
              <div className="w-2/3">
                <Select
                  value={exercise}
                  onValueChange={setExercise}
                  disabled={metric === "Workout"}
                >
                  <SelectTrigger className={metric === "Workout" ? "opacity-50 cursor-not-allowed" : ""}>
                    <SelectValue placeholder="Select Exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {metric !== "Workout" && (exercisesData[metric as keyof typeof exercisesData] || []).map((ex) => (
                      <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center">
              <label className="text-foreground text-xl w-1/3">Target</label>
              <div className="flex space-x-2 w-2/3">
                <Input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-1/3"
                />
                <div className="w-2/3">
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="w-30">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {metric === "Weight" && (
                        <SelectItem value="kg">kg</SelectItem>
                      )}
                      {metric === "Repetition" && (
                        <SelectItem value="rep">rep</SelectItem>
                      )}
                      {metric === "Distance" && (
                        <>
                          <SelectItem value="km">km</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                        </>
                      )}
                      {metric === "Duration" && (
                        <>
                          <SelectItem value="minute">minute</SelectItem>
                          <SelectItem value="hour">hour</SelectItem>
                        </>
                      )}
                      {metric === "Workout" && (
                        <>
                          <SelectItem value="session">session</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDeleteChallenge}
              >
                <Trash2 className="mr-2 h-4 w-4" />
              </Button>

              <Button
                className="bg-background text-foreground border hover:bg-secondary/50"
                onClick={handleUpdateChallenge}
              >
                Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Official Challenge Dialog */}
      <Dialog open={viewOfficialModalOpen} onOpenChange={setViewOfficialModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-foreground text-2xl font-normal">
              {currentChallenge?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-muted-foreground mb-3">
              Ends: {currentChallenge?.endDate} {!currentChallenge?.completed && `(${currentChallenge?.daysLeft} days left)`}
            </p>

            <div className="flex items-center mb-4">
              <div className="flex-grow mr-2">
                <Progress value={currentChallenge?.progress || 0} className="h-6" />
              </div>
              <span className="text-foreground font-medium">{currentChallenge?.progress}%</span>
            </div>

            <Tabs
              defaultValue="prize"
              className="w-full"
              onValueChange={(value) => {
                if (value === "leaderboard") {
                  setActiveLeaderboardTab("progress");
                  // Reset page when switching to leaderboard
                  setLeaderboardPage(1);
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="prize">Prize</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>

              <div className="h-[390px] w-full">
                <TabsContent
                  value="prize"
                  className="p-4 border rounded-md h-[390px] w-full overflow-auto"
                  style={{ minHeight: '390px', maxHeight: '390px', flexGrow: 0, flexShrink: 0 }}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-medium text-lg mb-2">Challenge Rewards</h3>
                      <p className="mb-4">Complete this challenge to earn exclusive badges and rewards! Finish within the top 10 for additional benefits.</p>

                      <h4 className="font-medium mt-2">Completion Rewards:</h4>
                      <ul className="list-disc pl-5 mt-1 mb-3">
                        <li>Exclusive profile badge</li>
                        <li>Achievement certificate</li>
                        <li>Special in-app recognition</li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-2 border-t">
                      <p className="text-sm text-muted-foreground italic">
                        Challenge completion is calculated based on your progress toward the goal.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="leaderboard"
                  className="h-[390px] w-full min-h-[390px] max-h-[390px] min-w-full max-w-full flex-none overflow-hidden box-border"
                >
                  <Card className="w-full h-full flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <CardDescription>Your rank: 198</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-y-auto flex-1 w-full" style={{ height: 'calc(390px - 130px)' }}>
                      <div className="w-full">
                        <Table className="w-full table-fixed">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[15%]">Rank</TableHead>
                              <TableHead className="w-[35%]">Username</TableHead>
                              <TableHead className="w-[25%]">Completion</TableHead>
                              <TableHead className="w-[25%]">Progress</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              // Calculate which entries to show based on pagination
                              const itemsPerPage = 5;
                              const startIndex = (leaderboardPage - 1) * itemsPerPage;
                              const endIndex = startIndex + itemsPerPage;
                              const displayedEntries = leaderboardData.slice(startIndex, endIndex);

                              return displayedEntries.map((entry) => (
                                <TableRow key={entry.rank}>
                                  <TableCell>{entry.rank}</TableCell>
                                  <TableCell>{entry.username}</TableCell>
                                  <TableCell>{entry.completionTime || "-"}</TableCell>
                                  <TableCell>{entry.progress}%</TableCell>
                                </TableRow>
                              ))
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center flex-shrink-0">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setLeaderboardPage(Math.max(1, leaderboardPage - 1));
                              }}
                              className={leaderboardPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              isActive
                              onClick={(e) => e.preventDefault()}
                            >
                              {leaderboardPage}
                            </PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                const maxPage = Math.ceil(leaderboardData.length / 5);
                                if (leaderboardPage < maxPage) {
                                  setLeaderboardPage(leaderboardPage + 1);
                                }
                              }}
                              className={leaderboardPage >= Math.ceil(leaderboardData.length / 5) ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChallengesPage;