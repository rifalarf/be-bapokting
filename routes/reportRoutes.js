import express from 'express';
import { fetchReportHandler, exportExcelHandler } from '../controllers/reportController.js';

const router = express.Router();

router.post('/report/prices', fetchReportHandler);
router.post('/report/export-excel', exportExcelHandler);
export default router;
