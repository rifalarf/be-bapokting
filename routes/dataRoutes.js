import express from 'express';
import { fetchDataHandler } from '../controllers/dataController.js';
import { getPriceChart } from '../controllers/graphController.js';

const router = express.Router();

router.post('/data', fetchDataHandler);
// router.post('/graph', getPriceChart);

export default router;
