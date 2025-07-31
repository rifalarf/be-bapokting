import express from 'express';
import {
  getUptLocations,
  getUptById,
  createUpt,
  updateUpt,
  deleteUpt
} from '../controllers/uptController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getUptLocations)
  .post(protect, admin, createUpt); 

router.route('/:id')
  .get(getUptById) 
  .put(protect, admin, updateUpt)   
  .delete(protect, admin, deleteUpt); 

export default router;