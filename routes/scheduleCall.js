import express from 'express';
import { createBothScheduleCall, createDoctorScheduleCall, createPharmacyScheduleCall, rescheduleScheduleCall, updateScheduleCall, getTodaysScheduleCalls, getUpcomingScheduleCalls, getCompletedScheduleCalls } from "../controllers/schedule.js";
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Route to create a doctor schedule call
router.post('/schedule/call/doctor',authMiddleware('admin'), createDoctorScheduleCall);

// Route to create a pharmacy schedule call
router.post('/schedule/call/pharmacy',authMiddleware('admin'), createPharmacyScheduleCall);

// Route to create a both schedule call
router.post('/schedule/call/both',authMiddleware('admin'), createBothScheduleCall);
router.patch('/schedule/reschedule',authMiddleware('admin'), rescheduleScheduleCall);
router.patch('/schedule/update-status',authMiddleware('admin'), updateScheduleCall);
router.get('/schedule/today', authMiddleware('admin'), getTodaysScheduleCalls);
router.get('/schedule/upcoming', authMiddleware('admin'), getUpcomingScheduleCalls);
router.get('/schedule/completed', authMiddleware('admin'), getCompletedScheduleCalls);

export default router;
