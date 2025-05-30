// components/competitions/competition-details.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Target,
  Calendar,
  MapPin,
  Users,
  Medal,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import api from "@/lib/api";
import {
  Competition,
  UserCompetition,
  CompetitionTask,
  LeaderboardEntry,
} from "@/types/competition";
import { TaskProgressDialog } from "./task-progress-dialog";

interface CompetitionDetailsProps {
  competition: Competition | UserCompetition;
  type: "available" | "ongoing" | "completed";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin?: () => void;
}

export const CompetitionDetails: React.FC<CompetitionDetailsProps> = ({
  competition,
  type,
  open,
  onOpenChange,
  onJoin,
}) => {
  const [allTasks, setAllTasks] = useState<CompetitionTask[]>([]);
  const [allLeaderboard, setAllLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CompetitionTask | null>(
    null
  );
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [competitionData, setCompetitionData] = useState<Competition | null>(
    null
  );

  // Pagination states
  const [tasksPage, setTasksPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const itemsPerPage = 5;

  const isUserCompetition = "totalPoints" in competition;
  const comp = isUserCompetition ? competition.competition : competition;
  const userProgress = isUserCompetition ? competition : null;

  // Calculate pagination for tasks
  const totalTasksPages = Math.ceil(allTasks.length / itemsPerPage);
  const paginatedTasks = allTasks.slice(
    (tasksPage - 1) * itemsPerPage,
    tasksPage * itemsPerPage
  );

  // Calculate pagination for leaderboard
  const totalLeaderboardPages = Math.ceil(allLeaderboard.length / itemsPerPage);
  const paginatedLeaderboard = allLeaderboard.slice(
    (leaderboardPage - 1) * itemsPerPage,
    leaderboardPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (open) {
      fetchCompetitionData();
      // Reset pagination when opening
      setTasksPage(1);
      setLeaderboardPage(1);
    }
  }, [open, comp.id]);

  const fetchCompetitionData = async () => {
    setLoading(true);
    try {
      // Fetch competition details by ID to get participant count and tasks
      const competitionResponse = await api.get(`/competitions/${comp.id}`);
      const competitionData = competitionResponse.data.data;
      setCompetitionData(competitionData);
      
      // Set all tasks
      setAllTasks(competitionData.competitionTasks || []);

      // Fetch leaderboard
      const leaderboardResponse = await api.get(
        `/competitions/${comp.id}/leaderboard`
      );
      setAllLeaderboard(leaderboardResponse.data.data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching competition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = (task: CompetitionTask) => {
    setSelectedTask(task);
    setProgressDialogOpen(true);
  };

  const handleProgressUpdated = () => {
    fetchCompetitionData();
    setProgressDialogOpen(false);
  };

  const getCurrentProgress = (task: CompetitionTask): number => {
    if (!task.taskProgress || task.taskProgress.length === 0) return 0;
    const progress = task.taskProgress[0];
    return parseFloat(progress.currentValue) || 0;
  };

  const getProgressPercentage = (task: CompetitionTask): number => {
    const current = getCurrentProgress(task);
    const target = parseFloat(task.targetValue);
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  const handleTasksPageChange = (newPage: number) => {
    setTasksPage(Math.max(1, Math.min(totalTasksPages, newPage)));
  };

  const handleLeaderboardPageChange = (newPage: number) => {
    setLeaderboardPage(Math.max(1, Math.min(totalLeaderboardPages, newPage)));
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-white" />;
      case 2:
        return <Medal className="h-4 w-4 text-white" />;
      case 3:
        return <Medal className="h-4 w-4 text-white" />;
      default:
        return <span className="text-sm font-semibold">#{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gold-badge text-white";
      case 2:
        return "bg-silver-badge text-white";
      case 3:
        return "bg-bronze-badge text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{comp.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Competition Image */}
            <div className="relative">
              <img
                src={comp.imageUrl || "/api/placeholder/800/300"}
                alt={comp.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute top-4 right-4">
                {type === "completed" && (
                  <Badge variant="default" className="bg-completed text-completed-foreground">
                    Completed
                  </Badge>
                )}
                {type === "ongoing" && (
                  <Badge variant="default">Ongoing</Badge>
                )}
                {type === "available" && (
                  <Badge variant="outline">Available</Badge>
                )}
              </div>
            </div>

            {/* Competition Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{comp.gym.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(comp.startDate)} -{" "}
                        {formatDate(comp.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {competitionData?._count?.participants || 
                         comp._count?.participants || 0}/{comp.maxParticipants}{" "}
                        participants
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {userProgress && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Total Points</span>
                        </div>
                        <span className="font-semibold">
                          {userProgress.totalPoints}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRankIcon(userProgress.rank)}
                          <span className="text-sm">Current Rank</span>
                        </div>
                        <span className="font-semibold">
                          #{userProgress.rank}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{userProgress.completionPct}%</span>
                        </div>
                        <Progress
                          value={parseFloat(userProgress.completionPct)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{comp.description}</p>
            </div>

            {/* Tabs for Tasks and Leaderboard */}
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks">
                  Tasks ({allTasks.length})
                </TabsTrigger>
                <TabsTrigger value="leaderboard">
                  Leaderboard ({allLeaderboard.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Competition Tasks</h3>
                  {type === "available" && onJoin && (
                    <Button onClick={onJoin}>Join Competition</Button>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading tasks...</div>
                ) : allTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No tasks available for this competition.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {paginatedTasks.map((task) => {
                        const currentProgress = getCurrentProgress(task);
                        const progressPercentage = getProgressPercentage(task);
                        const target = parseFloat(task.targetValue);

                        return (
                          <Card key={task.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {task.name}
                                </CardTitle>
                                <Badge variant="outline">
                                  {task.pointsValue} points
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                {task.description}
                              </p>
                              
                              {/* Progress bar for ongoing/completed competitions */}
                              {(type === "ongoing" || type === "completed") && (
                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>
                                      {currentProgress} / {target} {task.unit} ({progressPercentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <Progress value={progressPercentage} />
                                  {progressPercentage >= 100 && (
                                    <div className="flex items-center gap-1 text-sm text-green-600">
                                      <Trophy className="h-4 w-4" />
                                      <span>Task Completed! 🎉</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Target:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {task.targetValue} {task.unit}
                                  </span>
                                </div>
                                {type === "ongoing" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateProgress(task)}
                                  >
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Update Progress
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Tasks Pagination */}
                    {totalTasksPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTasksPageChange(tasksPage - 1)}
                          disabled={tasksPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalTasksPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={page === tasksPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleTasksPageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTasksPageChange(tasksPage + 1)}
                          disabled={tasksPage === totalTasksPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-4">
                <h3 className="text-lg font-semibold">Leaderboard</h3>
                {loading ? (
                  <div className="text-center py-8">Loading leaderboard...</div>
                ) : allLeaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No participants yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {paginatedLeaderboard.map((entry, index) => {
                        const globalIndex = (leaderboardPage - 1) * itemsPerPage + index;
                        const isCurrentUser = userProgress && entry.userId === userProgress.userId;
                        
                        return (
                          <Card key={entry.id} className={isCurrentUser ? "ring-2 ring-primary" : ""}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${getRankBadgeClass(entry.rank)}`}>
                                    {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                                  </div>
                                  <div>
                                    <p className={`font-medium ${isCurrentUser ? "text-primary" : ""}`}>
                                      {entry.user.displayName}
                                      {isCurrentUser && " (You)"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {entry.completionPct}% complete
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    {entry.totalPoints} pts
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {entry._count.taskProgress} tasks
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Leaderboard Pagination */}
                    {totalLeaderboardPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaderboardPageChange(leaderboardPage - 1)}
                          disabled={leaderboardPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalLeaderboardPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={page === leaderboardPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleLeaderboardPageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaderboardPageChange(leaderboardPage + 1)}
                          disabled={leaderboardPage === totalLeaderboardPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <TaskProgressDialog
          task={selectedTask}
          open={progressDialogOpen}
          onOpenChange={setProgressDialogOpen}
          onProgressUpdated={handleProgressUpdated}
        />
      )}
    </>
  );
};
