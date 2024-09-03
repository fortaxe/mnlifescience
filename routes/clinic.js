import express from 'express';
import { createClinic } from "../controllers/Clinic.js";
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/createClinic', authMiddleware('mr'), createClinic);

export default router;
