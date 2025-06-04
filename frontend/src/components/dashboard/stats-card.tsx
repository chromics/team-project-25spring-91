"use client";

interface StatRecord {
  value: number;
}

interface Records {
  completionRate: StatRecord;
  totalCompletion: StatRecord;
}

// Mock data - replace with actual data fetching
const records: Records = {
  completionRate: {
    value: 100,
  },
  totalCompletion: {
    value: 100,
  },
};

export function StatsCard() {
  return (
    <div className="border-2 border-primary/20 bg-card p-4 sm:p-8 rounded-xl w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-4">
        {/* Completion Rate */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
            {records.completionRate.value}
            <span className="text-lg sm:text-xl text-primary/80 ml-1">
              %
            </span>
          </div>
          <div className="text-sm text-muted-foreground italic">
            Completion rate (Last 30 days)
          </div>
        </div>

        {/* Divider - Only shown on larger screens */}
        <div className="hidden sm:block h-32 w-px bg-border border-1 border-primary/20"></div>

        {/* Horizontal divider for mobile */}
        <div className="w-1/2 h-px bg-border sm:hidden"></div>

        {/* Total Completion */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <div className="flex flex-wrap items-baseline text-2xl sm:text-3xl font-bold text-primary">
            {records.totalCompletion.value}
            <span className="text-lg sm:text-xl text-primary/80 ml-1">
              {records.totalCompletion.value > 1 ? "workouts" : "workout"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground italic">
            Total completion
          </div>
        </div>

      </div>
    </div>
  );
}
