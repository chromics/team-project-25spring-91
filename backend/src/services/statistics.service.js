const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const statisticsService = {

}

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