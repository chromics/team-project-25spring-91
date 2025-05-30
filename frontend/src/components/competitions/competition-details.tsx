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
} from "lucide-react";
import api from "@/lib/api";
import {
  Competition,
  UserCompetition,
  CompetitionTask,
  LeaderboardEntry,
} from "@/types/competition";
import { TaskProgressDialog } from "./TaskProgressDialog";

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
  const [tasks, setTasks] = useState<CompetitionTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CompetitionTask | null>(
    null
  );
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  const isUserCompetition = "totalPoints" in competition;
  const comp = isUserCompetition ? competition.competition : competition;
  const userProgress = isUserCompetition ? competition : null;

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
    }
  }, [open, comp.id]);

  const fetchCompetitionData = async () => {
    setLoading(true);
    try {
      // Fetch competition details with tasks
      const competitionResponse = await api.get(`/competitions/${comp.id}`);
      const competitionData = competitionResponse.data.data;
      
      // Set tasks from competition details
      setTasks(competitionData.competitionTasks || []);

      // Fetch leaderboard
      const leaderboardResponse = await api.get(
        `/competitions/${comp.id}/leaderboard`
      );
      setLeaderboard(leaderboardResponse.data.data.leaderboard || []);
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
                  <Badge variant="secondary" className="bg-completed">
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
                        {comp._count?.participants || 0}/{comp.maxParticipants}{" "}
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
                          <Medal className="h-4 w-4 text-muted-foreground" />
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
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
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
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No tasks available for this competition.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tasks.map((task) => (
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
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-4">
                <h3 className="text-lg font-semibold">Leaderboard</h3>
                {loading ? (
                  <div className="text-center py-8">Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No participants yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <Card key={entry.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                                {entry.rank}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {entry.user.displayName}
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
                    ))}
                  </div>
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
