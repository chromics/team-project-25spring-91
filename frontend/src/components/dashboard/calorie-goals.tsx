"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

interface CalorieGoal {
  id: string;
  title: string;
  subtitle: string;
  goal: number;
  current: number;
  unit: string;
}

export function CalorieGoals() {
  const [goals, setGoals] = useState<CalorieGoal[]>([
    {
      id: "burned",
      title: "Set Calories Burned Goals",
      subtitle: "Today's Goal",
      goal: 350,
      current: 280,
      unit: "calories/day",
    },
    {
      id: "consumed",
      title: "Set Calories Consumed Goals",
      subtitle: "Today's Goal",
      goal: 1500,
      current: 1200,
      unit: "calories/day",
    },
  ]);

  const updateGoal = (id: string, increment: boolean) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              goal: increment
                ? goal.goal + 50
                : Math.max(0, goal.goal - 50),
            }
          : goal
      )
    );
  };

  const getChartData = (goal: CalorieGoal) => {
    const percentage = Math.min((goal.current / goal.goal) * 100, 100);
    return [
      {
        name: "progress",
        value: percentage,
        fill: percentage >= 100 ? "#22c55e" : "#3b82f6",
      },
    ];
  };

  return (
    <div className="space-y-6">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border rounded-xl p-6"
        >
          {/* Goal Setter */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{goal.title}</h3>
              <p className="text-sm text-muted-foreground">{goal.subtitle}</p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateGoal(goal.id, false)}
                className="h-12 w-12 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="text-center">
                <div className="text-4xl font-bold">{goal.goal}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {goal.unit}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => updateGoal(goal.id, true)}
                className="h-12 w-12 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button className="w-full">Set Goal</Button>
          </div>

          {/* Progress Chart */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={getChartData(goal)}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill="currentColor"
                    className="text-primary"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">{goal.current}</div>
                <div className="text-sm text-muted-foreground">
                  of {goal.goal}
                </div>
                <div className="text-xs text-muted-foreground">calories</div>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-sm font-medium">
                {goal.id === "burned" ? "Calories Burned" : "Calories Consumed"}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((goal.current / goal.goal) * 100)}% of goal
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
