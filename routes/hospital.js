import express from 'express';
import { createHospital, editHospital, getHospital } from "../controllers/hospital.js";
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/createClinic', authMiddleware('mr'), createHospital);
router.get('/getClinic/:id', authMiddleware('mr'), getHospital);
router.patch('/editClinic/:id', authMiddleware('mr'), editHospital);

export default router;
