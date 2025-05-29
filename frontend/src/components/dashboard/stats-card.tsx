"use client";

interface StatRecord {
  value: number;
  unit: string;
  unitPlural: string;
  description: string;
}

interface Records {
  currentStreak: StatRecord;
  longestStreak: StatRecord;
  currentRanking: StatRecord;
}

// Mock data - replace with actual data fetching
const records: Records = {
  currentRanking: {
    value: 1,
    unit: "rank",
    unitPlural: "ranks",
    description: "Current Ranking",
  },
  currentStreak: {
    value: 100,
    unit: "week",
    unitPlural: "weeks",
    description: "Current Streak",
  },
  longestStreak: {
    value: 100,
    unit: "week",
    unitPlural: "weeks",
    description: "Longest Streak",
  },
};

export function StatsCard() {
  return (
    <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-4">
        {/* Current Ranking */}
        <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
          <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
            {records.currentRanking.value}
            <span className="text-lg sm:text-xl text-primary/80 ml-1">
              {records.currentRanking.value > 1
                ? records.currentRanking.unitPlural
                : records.currentRanking.unit}
            </span>
          </div>
          <div className="text-sm text-muted-foreground italic">
            {records.currentRanking.description}
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
      </div>
    </div>
  );
}
