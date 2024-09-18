import express from 'express';
import { getAllMRs, getAllClinics, adminEditClinic, getNotes, editNotes, adminDeleteClinic } from '../controllers/admin.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Route to get all MRs - accessible only to admin
router.get('/getMrs', authMiddleware('admin'), getAllMRs);

// Route to get all Clinics/Lead Forms - accessible only to admin
router.get('/getClinics', authMiddleware('admin'),  getAllClinics);

router.patch('/admin/edit-clinic', authMiddleware('admin'), adminEditClinic);

router.get('/admin/get-notes', authMiddleware('admin'), getNotes);

router.patch('/admin/edit-notes', authMiddleware('admin'), editNotes);

router.delete('/admin/delete-clinic', authMiddleware('admin'), adminDeleteClinic);

export default router;
