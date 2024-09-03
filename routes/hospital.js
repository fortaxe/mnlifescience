import express from 'express';
import { createHospital } from "../controllers/hospital.js";
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/createClinic', authMiddleware('mr'), createHospital);

export default router;
