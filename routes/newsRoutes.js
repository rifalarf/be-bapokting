import express from 'express';
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  upload
} from '../controllers/newsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, admin, upload.single('newsImage'), createNews);

router
  .route('/:id')
  .get(getNewsById)
  .put(protect, admin, upload.single('newsImage'), updateNews)
  .delete(protect, admin, deleteNews);

export default router;
