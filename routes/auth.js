import express from 'express';
import { adminSignin, mrSignin, createMR, createAdmin, editMR, deleteMR, editAdmin } from '../controllers/auth.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/admin/signin', adminSignin);
router.post('/user/signin', mrSignin);
router.post('/admin/create-mr', authMiddleware('admin'), createMR);
router.post('/admin/create', createAdmin);
router.patch('/admin/edit-mr', authMiddleware('admin'), editMR);
router.delete('/admin/delete-mr', authMiddleware('admin'), deleteMR);
router.patch("/admin/edit/:id", authMiddleware("admin"), editAdmin);

export default router;
