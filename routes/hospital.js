import express from 'express';
import { createHospital, editHospital, getHospital, getAllClinics, addFollowUp } from "../controllers/hospital.js";
import authMiddleware from '../middleware/auth.js';
import { uploadDoctorImage, uploadDocuments, uploadFollowUpImage } from "../middleware/uploadDocuments.js";

const router = express.Router();

router.post('/createClinic', uploadDoctorImage, authMiddleware('mr'), createHospital);
router.post('/follow-up/:id', uploadFollowUpImage, authMiddleware('mr'), addFollowUp);
router.get('/getClinic/:id', authMiddleware('mr'), getHospital);
router.get('/allClinics', authMiddleware('mr'), getAllClinics);
router.patch('/editClinic/:id', authMiddleware('mr'), editHospital);
// router.patch('/forgot-password', forgotPasswordMR);

export default router;
