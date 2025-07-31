import express from 'express';
import { loginAdmin } from '../controllers/authController.js';
const router = express.Router();

router.post('/login', loginAdmin);
// router.post('/forgot-password', forgotPassword);
// router.put('/reset-password/:token', resetPassword); 

export default router;
