//src/controllers/planned.controller.js
const { plannedService } = require('../services/planned.service');

const plannedController = {
  getAllPlannedWorkouts: async (req, res) => {
    const userId = req.user.id;
    const workouts = await plannedService.getAllPlannedWorkouts(userId);
    
    res.status(200).json({
      status: 'success',
      results: workouts.length,
      data: workouts
    });
  },
  
  getUpcomingWorkouts: async (req, res) => {
    const userId = req.user.id;
    const { days = 7 } = req.query;
    
    const workouts = await plannedService.getUpcomingWorkouts(userId, parseInt(days));
    
    res.status(200).json({
      status: 'success',
      results: workouts.length,
      data: workouts
    });
  },
  

  
  getPlannedWorkoutById: async (req, res) => {
    const userId = req.user.id;
    const workoutId = parseInt(req.params.id);
    
    const workout = await plannedService.getPlannedWorkoutById(userId, workoutId);
    
    res.status(200).json({
      status: 'success',
      data: workout
    });
  },
  
  createPlannedWorkout: async (req, res) => {
    const userId = req.user.id;
    const workoutData = {
      ...req.body,
      userId
    };
    
    const newWorkout = await plannedService.createPlannedWorkout(workoutData);
    
    res.status(201).json({
      status: 'success',
      message: 'Workout scheduled successfully',
      data: newWorkout
    });
  },
  
  updatePlannedWorkout: async (req, res) => {
    const userId = req.user.id;
    const workoutId = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedWorkout = await plannedService.updatePlannedWorkout(userId, workoutId, updateData);
    
    res.status(200).json({
      status: 'success',
      message: 'Workout updated successfully',
      data: updatedWorkout
    });
  },
  
  deletePlannedWorkout: async (req, res) => {
    const userId = req.user.id;
    const workoutId = parseInt(req.params.id);
    
    await plannedService.deletePlannedWorkout(userId, workoutId);
    
    res.status(200).json({
      status: 'success',
      message: 'Workout deleted successfully'
    });
  }
};

module.exports = { plannedController };