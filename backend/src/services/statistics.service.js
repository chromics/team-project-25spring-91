const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const statisticsService = {

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