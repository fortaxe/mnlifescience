import express from 'express';
import { adminSignin, mrSignin, createMR, createAdmin } from '../controllers/auth.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/admin/signin', adminSignin);
router.post('/user/signin', mrSignin);
router.post('/admin/create-mr', authMiddleware('admin'), createMR);
router.post('/admin/create', createAdmin);

export default router;
