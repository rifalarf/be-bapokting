import express from 'express';
import { getCommodityList } from '../controllers/commodityController.js';

const router = express.Router();

router.post('/list', getCommodityList);

export default router;
