import express from 'express';
import { getAllMRs, getAllClinics } from '../controllers/admin.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Route to get all MRs - accessible only to admin
router.get('/getMrs',  getAllMRs);

// Route to get all Clinics/Lead Forms - accessible only to admin
router.get('/getClinics',   getAllClinics);

export default router;
