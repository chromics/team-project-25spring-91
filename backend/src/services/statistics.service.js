const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

// Update statisticsService object to include getDashboardStatistics
const statisticsService = {
    // Get user's workout statistics dashboard data
    getDashboardStatistics: async (userId) => {
      // Get all the required statistics in one comprehensive API call
      const dashboardData = {};
      
      // 1. Completed Workout Sessions count
      dashboardData.completedWorkoutSessions = await prisma.actualWorkout.count({
        where: { userId }
      });
      
      // 2. Current Month Completion Rate
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Get planned workouts for the current month
      const plannedWorkoutsThisMonth = await prisma.plannedWorkout.count({
        where: {
          userId,
          scheduledDate: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      });
      
      // Get completed workouts that were linked to planned workouts
      const completedPlannedWorkoutsThisMonth = await prisma.actualWorkout.count({
        where: {
          userId,
          plannedId: { not: null }, // Only count those linked to planned workouts
          completedDate: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      });
      
      // Calculate rate based on planned workouts that were completed
      dashboardData.currentMonthCompletionRate = plannedWorkoutsThisMonth > 0
        ? Math.min(100, (completedPlannedWorkoutsThisMonth / plannedWorkoutsThisMonth) * 100)
        : 0;
      
      // 3. Monthly Workout Sessions (for the last 5 years)
      const currentYear = currentDate.getFullYear();
      const lastFiveYearsData = [];
      
      // Loop through the last 5 years (including current)
      for (let yearOffset = 0; yearOffset < 5; yearOffset++) {
        const year = currentYear - yearOffset;
        const yearData = {
          year,
          months: []
        };
        
        // Get data for each month in this year
        for (let month = 0; month < 12; month++) {
          const startDate = new Date(year, month, 1);
          const endDate = new Date(year, month + 1, 0);
          
          // Skip future months in current year
          if (yearOffset === 0 && startDate > currentDate) {
            yearData.months.push({
              month: month + 1,
              monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
              count: 0
            });
            continue;
          }
          
          const count = await prisma.actualWorkout.count({
            where: {
              userId,
              completedDate: {
                gte: startDate,
                lte: endDate
              }
            }
          });
          
          yearData.months.push({
            month: month + 1,
            monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
            count
          });
        }
        
        lastFiveYearsData.push(yearData);
      }
      
      dashboardData.workoutsByYear = lastFiveYearsData;
      
      // Also include currentYear data separately for backward compatibility
      dashboardData.monthlyCompletedWorkouts = lastFiveYearsData[0].months;
      
      // 4. Weekly Streaks (both longest and current)
      const allWorkouts = await prisma.actualWorkout.findMany({
        where: { userId },
        select: { completedDate: true },
        orderBy: { completedDate: 'asc' }
      });
      
      const streaks = calculateWeeklyStreaks(allWorkouts.map(w => w.completedDate));
      
      // Add debugging info to help understand streak calculation
      console.log("Total workouts:", allWorkouts.length);
      console.log("Longest streak:", streaks.longest);
      console.log("Current streak:", streaks.current);
      
      dashboardData.longestStreak = streaks.longest;
      dashboardData.currentStreak = streaks.current;
      
      // 5. Best records (heaviest weight, most reps, most sets)
      const bestRecords = await getBestExerciseRecords(userId);
      dashboardData.bestRecords = bestRecords;
      
      // 6. Monthly volume totals for the last 5 years
      const volumeByYear = [];
      
      // Loop through the last 5 years (including current)
      for (let yearOffset = 0; yearOffset < 5; yearOffset++) {
        const year = currentYear - yearOffset;
        const yearData = {
          year,
          months: await getMonthlyVolumeData(userId, year)
        };
        
        volumeByYear.push(yearData);
      }
      
      dashboardData.volumeByYear = volumeByYear;
      
      // Also include currentYear data separately for backward compatibility
      dashboardData.monthlyVolume = volumeByYear[0].months;
      
      // 7. Top 3 most frequent exercises
      const topExercises = await getTopExercises(userId, 3);
      dashboardData.topExercises = topExercises;
      
      return dashboardData;
    },
  };

// Helper function to get best exercise records
async function getBestExerciseRecords(userId) {
    // Get all exercises with their stats
    const exercises = await prisma.actualExercise.findMany({
      where: {
        actualWorkout: {
          userId
        }
      },
      include: {
        exercise: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Find records
    let heaviestWeight = { weight: 0, exercise: null };
    let mostReps = { reps: 0, exercise: null };
    let mostSets = { sets: 0, exercise: null };
    
    exercises.forEach(ex => {
      // Convert Decimal to Number for comparison
      const weight = ex.actualWeight ? parseFloat(ex.actualWeight.toString()) : 0;
      
      // Heaviest weight
      if (weight > parseFloat(heaviestWeight.weight.toString() || '0')) {
        heaviestWeight = {
          weight: ex.actualWeight,
          exercise: ex.exercise
        };
      }
      
      // Most reps
      if (ex.actualReps && ex.actualReps > mostReps.reps) {
        mostReps = {
          reps: ex.actualReps,
          exercise: ex.exercise
        };
      }
      
      // Most sets
      if (ex.actualSets && ex.actualSets > mostSets.sets) {
        mostSets = {
          sets: ex.actualSets,
          exercise: ex.exercise
        };
      }
    });
    
    return {
      heaviestWeight,
      mostReps,
      mostSets
    };
  }
  
  // Helper function to get monthly volume data
  async function getMonthlyVolumeData(userId, year) {
    const volumeData = [];
    const currentDate = new Date();
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      // Skip future months
      if (startDate > currentDate) {
        volumeData.push({
          month: month + 1,
          monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
          volume: 0
        });
        continue;
      }
      
      // Get all exercises in this month
      const exercises = await prisma.actualExercise.findMany({
        where: {
          actualWorkout: {
            userId,
            completedDate: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        select: {
          actualSets: true,
          actualReps: true,
          actualWeight: true
        }
      });
      
      // Calculate total volume for month
      let totalVolume = 0;
      exercises.forEach(ex => {
        totalVolume += calculateVolume(ex.actualSets, ex.actualReps, ex.actualWeight);
      });
      
      volumeData.push({
        month: month + 1,
        monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
        volume: totalVolume
      });
    }
    
    return volumeData;
  }
  
  // Helper function to get top most frequent exercises
  async function getTopExercises(userId, limit) {
    // Get count of each exercise used
    const exerciseCounts = await prisma.actualExercise.groupBy({
      by: ['exerciseId'],
      where: {
        actualWorkout: {
          userId
        }
      },
      _count: {
        exerciseId: true
      }
    });
    
    // Sort by count descending
    exerciseCounts.sort((a, b) => b._count.exerciseId - a._count.exerciseId);
    
    // Get top N exercises
    const topExerciseIds = exerciseCounts.slice(0, limit).map(e => e.exerciseId);
    
    if (topExerciseIds.length === 0) {
      return [];
    }
    
    // Get exercise details
    const topExercises = await prisma.exercise.findMany({
      where: {
        id: {
          in: topExerciseIds
        }
      }
    });
    
    // Map count to exercises and sort
    return topExerciseIds.map(id => {
      const exercise = topExercises.find(e => e.id === id);
      const count = exerciseCounts.find(e => e.exerciseId === id)._count.exerciseId;
      return {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        count
      };
    });
  }




//finish 

// Helper function to calculate weekly streaks
function calculateWeeklyStreaks(dates) {
    if (dates.length === 0) {
      return { longest: 0, current: 0 };
    }
    
    // Group workout dates by week, using ISO week format for consistency
    const weekMap = new Map();
    
    dates.forEach(date => {
      // Get ISO week number (1-52/53)
      const year = date.getFullYear();
      const weekNum = getWeekNumber(date);
      const weekKey = `${year}-W${weekNum}`;
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, true);
      }
    });
    
    // Convert to array of week keys and sort
    const weekKeys = Array.from(weekMap.keys()).sort();
    
    if (weekKeys.length === 0) {
      return { longest: 0, current: 0 };
    }
    
    // Debug: Print week keys
    console.log(`Found ${weekKeys.length} unique workout weeks`);
    
    // Calculate streaks by looking for consecutive week numbers
    let currentStreak = 1;
    let maxStreak = 1;
    let streaks = [{ start: weekKeys[0], length: 1 }];
    
    for (let i = 1; i < weekKeys.length; i++) {
      const [prevYear, prevWeek] = parseWeekKey(weekKeys[i-1]);
      const [currYear, currWeek] = parseWeekKey(weekKeys[i]);
      
      // Check if weeks are consecutive
      const isConsecutive = 
        (prevYear === currYear && currWeek - prevWeek === 1) || 
        (currYear - prevYear === 1 && 
         ((prevWeek === 52 && currWeek === 1) || (prevWeek === 53 && currWeek === 1)));
      
      if (isConsecutive) {
        // Continue current streak
        currentStreak++;
        streaks[streaks.length - 1].length = currentStreak;
      } else {
        // Start new streak
        currentStreak = 1;
        streaks.push({ start: weekKeys[i], length: 1 });
      }
      
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    }
    
    // Debug: Print all streaks
    console.log("All streaks:", streaks.map(s => `${s.start} (${s.length} weeks)`).join(', '));
    
    // Find current streak by checking if the most recent week includes this week
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisWeek = getWeekNumber(today);
    const thisWeekKey = `${thisYear}-W${thisWeek}`;
    
    // Find the last streak and check if it includes this week
    const lastStreak = streaks[streaks.length - 1];
    const [lastStreakYear, lastStreakWeek] = parseWeekKey(lastStreak.start);
    const lastStreakEndWeek = lastStreakWeek + lastStreak.length - 1;
    
    let activeCurrentStreak = 0;
    
    // Check if the last workout was in the current week
    if (weekMap.has(thisWeekKey)) {
      // If we have a workout this week, the current streak includes this week
      activeCurrentStreak = lastStreak.length;
    } else {
      // Check if the last workout was in the previous week
      const lastDate = new Date(dates[dates.length - 1]);
      const lastWorkoutYear = lastDate.getFullYear();
      const lastWorkoutWeek = getWeekNumber(lastDate);
      
      // Debug: Print current streak information
      console.log(`Current week: ${thisYear}-W${thisWeek}`);
      console.log(`Last workout week: ${lastWorkoutYear}-W${lastWorkoutWeek}`);
      
      // Calculate weeks difference
      const weeksDiff = getWeeksDifference(
        lastWorkoutYear, lastWorkoutWeek,
        thisYear, thisWeek
      );
      
      console.log(`Weeks difference: ${weeksDiff}`);
      
      if (weeksDiff <= 1) {
        // If last workout was in the previous week, streak is still active
        activeCurrentStreak = lastStreak.length;
      } else {
        // Streak is broken - more than a week has passed
        activeCurrentStreak = 0;
      }
    }
    
    return { longest: maxStreak, current: activeCurrentStreak };
  }

    function calculateVolume(sets, reps, weight) {
        if (!sets || !reps || !weight) return 0;
        return sets * reps * weight;
    }

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
  
  function parseWeekKey(weekKey) {
    const [year, weekPart] = weekKey.split('-');
    const week = parseInt(weekPart.substring(1), 10);
    return [parseInt(year, 10), week];
  }
  
  function getWeeksDifference(year1, week1, year2, week2) {
    const weeks1 = year1 * 52 + week1;
    const weeks2 = year2 * 52 + week2;
    return Math.abs(weeks2 - weeks1);
  }

  

module.exports = { statisticsService };

//note that AI is used for some part of this folder since this one is a bit difficult and had so many errors