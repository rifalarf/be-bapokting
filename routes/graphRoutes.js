import express from 'express';
import { getPriceChart } from '../controllers/graphController.js';

const router = express.Router();

router.post('/graph', getPriceChart);

export default router;
