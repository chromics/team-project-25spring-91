"use client";
import { SheetDemo } from '@/components/add-goal-sheet'
import { Button } from '@/components/ui/button';
import { SheetTrigger } from '@/components/ui/sheet';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { useState } from 'react'

interface Goal {
  date: string;
  calories: number;
  title: string; 
}

const setGoalPage = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      date: new Date().toISOString(),
      calories: 2000, 
      title: 'leg day'
    }
  ]);

  const handleAddGoal = (newGoal: Goal) => {
    setGoals([...goals, newGoal]);
  }

  // 
  const groupGoals = (goals: Goal[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    return {
      future: goals.filter(goal => {
        const goalDate = new Date(goal.date);
        goalDate.setHours(0, 0, 0, 0);
        return goalDate.getTime() > today.getTime();
      }),
      today: goals.filter(goal => {
        const goalDate = new Date(goal.date);
        goalDate.setHours(0, 0, 0, 0);
        return goalDate.getTime() === today.getTime();
      }),
      lastWeek: goals.filter(goal => {
        const goalDate = new Date(goal.date);
        goalDate.setHours(0, 0, 0, 0);
        return goalDate.getTime() < today.getTime() &&
          goalDate.getTime() >= sevenDaysAgo.getTime();
      }),
      past: goals.filter(goal => {
        const goalDate = new Date(goal.date);
        goalDate.setHours(0, 0, 0, 0);
        return goalDate.getTime() < sevenDaysAgo.getTime();
      })
    };
  };

  const renderSortedGoals = (goals: Goal[]) => {
    const sortedGoals = [...goals].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedGoals.map(goal => (
      <li
        key={new Date(goal.date).toISOString()}
        className="px-4 py-2 rounded-lg border shadow-sm"
      >
        <div className='flex justify-between'>
          <div>
        
            <p className="font-bold">{goal.title}</p>
            <p className="font-medium">{goal.calories} calories</p>
            <p className="text-sm text-gray-600">
              {new Date(goal.date).toLocaleDateString()}
            </p>
          </div>

          <div className="inline-flex items-center h-5 px-2 text-[10px] rounded-full border border-green-500 text-green-600 bg-green-50">
            Online
          </div>
        </div>
      </li>
    ));
  };

  const groupedGoals = groupGoals(goals);

  //



  return (
    <div>
      {/* <DialogAddGoal />  */}

      <SheetDemo propAddGoal={handleAddGoal} />


      <div className="mt-8 max-w mx-auto px-20">
        <h2 className="text-xl font-semibold mb-4">Your Calorie Goals</h2>

        {/* <ul className="space-y-3">
          {goals.map((goal, index) => (
            <SidebarGroup key={new Date((goal.date)).toLocaleDateString()}>
              <SidebarGroupLabel>{new Date((goal.date)).toLocaleDateString()}</SidebarGroupLabel>
              <li
                key={index}
                className="p-4 rounded-lg border shadow-sm"
              >
                <p className="font-medium">{goal.calories} calories</p>
                <p className="text-sm text-gray-600">
                  {new Date(goal.date).toLocaleDateString()}
                </p>
              </li>
            </SidebarGroup>
          ))}
        </ul> */}
        <div className="space-y-8">
          {groupedGoals.today.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Today</SidebarGroupLabel>
              <ul className="space-y-3">
                {renderSortedGoals(groupedGoals.today)}
              </ul>
            </SidebarGroup>
          )}

          {groupedGoals.future.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Future Goals</SidebarGroupLabel>
              <ul className="space-y-3">
                {renderSortedGoals(groupedGoals.future)}
              </ul>
            </SidebarGroup>
          )}

          {groupedGoals.lastWeek.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
              <ul className="space-y-3">
                {renderSortedGoals(groupedGoals.lastWeek)}
              </ul>
            </SidebarGroup>
          )}

          {groupedGoals.past.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Past Records</SidebarGroupLabel>
              <ul className="space-y-3">
                {renderSortedGoals(groupedGoals.past)}
              </ul>
            </SidebarGroup>
          )}

          {goals.length === 0 && (
            <p className="text-center text-gray-500">
              No goals set yet. Add your first goal!
            </p>
          )}
        </div>
      </div>
    </div>

  )
}

export default setGoalPage