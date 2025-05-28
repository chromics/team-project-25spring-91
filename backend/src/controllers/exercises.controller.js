//src/controllers/exercises.controller.js
const { exerciseService } = require('../services/exercises.service');

const exerciseController = {
  getAllExercises: async (req, res) => {
    const { category, search } = req.query;
    const exercises = await exerciseService.getAllExercises(category, search);
    
    res.status(200).json({
      status: 'success',
      results: exercises.length,
      data: exercises
    });
  },
  
  getExerciseById: async (req, res) => {
    const exerciseId = parseInt(req.params.id);
    const exercise = await exerciseService.getExerciseById(exerciseId);
    
    res.status(200).json({
      status: 'success',
      data: exercise
    });
  },
  
  createExercise: async (req, res) => {
    const exerciseData = req.body;
    const newExercise = await exerciseService.createExercise(exerciseData);
    
    res.status(201).json({
      status: 'success',
      message: 'Exercise created successfully',
      data: newExercise
    });
  },
  
  updateExercise: async (req, res) => {
    const exerciseId = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedExercise = await exerciseService.updateExercise(exerciseId, updateData);
    
    res.status(200).json({
      status: 'success',
      message: 'Exercise updated successfully',
      data: updatedExercise
    });
  },
  
  deleteExercise: async (req, res) => {
    const exerciseId = parseInt(req.params.id);
    await exerciseService.deleteExercise(exerciseId);
    
    res.status(200).json({
      status: 'success',
      message: 'Exercise deleted successfully'
    });
  }
};

module.exports = { exerciseController };