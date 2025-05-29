export interface Competition {
  id: number;
  gymId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  maxParticipants: number;
  isActive: boolean;
  createdAt: string;
  gym: {
    id: number;
    name: string;
    imageUrl: string | null;
  };
  _count?: { 
    participants: number;
    competitionTasks: number;
  };
}

export interface UserCompetition {
  id: number;
  userId: number;
  competitionId: number;
  joinDate: string;
  totalPoints: number;
  completionPct: string;
  rank: number;
  isActive: boolean;
  competition: Competition;
  _count: {
    taskProgress: number;
  };
}

export interface CompetitionTask {
  id: number;
  competitionId: number;
  exerciseId: number;
  name: string;
  description: string;
  targetValue: string;
  pointsValue: number;
  metric: string;
  unit: string;
  exercise: {
    id: number;
    name: string;
    category: string;
  };
}

export interface TaskProgress {
  id: number;
  participantId: number;
  taskId: number;
  currentValue: string;
  isCompleted: boolean;
  completionDate: string | null;
  lastUpdated: string;
  notes: string | null;
}

export interface LeaderboardEntry {
  id: number;
  userId: number;
  competitionId: number;
  joinDate: string;
  totalPoints: number;
  completionPct: string;
  rank: number;
  isActive: boolean;
  user: {
    id: number;
    displayName: string;
    imageUrl: string | null;
  };
  _count: {
    taskProgress: number;
  };
}
