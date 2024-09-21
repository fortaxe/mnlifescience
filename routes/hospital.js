import express from 'express';
import { createHospital, editHospital, getHospital, getAllClinics } from "../controllers/hospital.js";
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/createClinic', authMiddleware('mr'), createHospital);
router.get('/getClinic/:id', authMiddleware('mr'), getHospital);
router.get('/allClinics', authMiddleware('mr'), getAllClinics);
router.patch('/editClinic/:id', authMiddleware('mr'), editHospital);
// router.patch('/forgot-password', forgotPasswordMR);

export default router;
