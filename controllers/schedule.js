import ScheduleCall from "../models/ScheduleCall.js";
import Clinic from "../models/Clinic.js";
import { response } from "express";

// Create Doctor Schedule Call
export const createDoctorScheduleCall = async (req, res) => {
    const { clinicId, date, time } = req.body;

    try {
        const clinic = await Clinic.findById(clinicId);
        if (!clinic || !clinic.doctorNumber) {
            return res.status(404).json({ message: 'Doctor clinic not found or no doctor number' });
        }

        const existingSchedule = await ScheduleCall.findOne({ date, time });
        if (existingSchedule) {
            return res.status(400).json({ message: 'A schedule call already exists for this date and time' });
        }

        const scheduleCall = new ScheduleCall({
            clinic: clinicId,
            date,
            time,
            reschedule: false,
            updateStatus: 'Scheduled',
            createdBy: clinic.createdBy,
            type: 'doctor'
        });

        await scheduleCall.save();
        res.status(201).json({ message: 'Doctor schedule call created successfully', scheduleCall });
    } catch (error) {
        console.error('Error creating doctor schedule call:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Pharmacy Schedule Call
export const createPharmacyScheduleCall = async (req, res) => {
    const { clinicId, date, time } = req.body;

    try {
        const clinic = await Clinic.findById(clinicId);
        if (!clinic || !clinic.pharmacyNumber) {
            return res.status(404).json({ message: 'Pharmacy clinic not found or no pharmacy number' });
        }

        const existingSchedule = await ScheduleCall.findOne({ date, time });
        if (existingSchedule) {
            return res.status(400).json({ message: 'A schedule call already exists for this date and time' });
        }

        const scheduleCall = new ScheduleCall({
            clinic: clinicId,
            date,
            time,
            reschedule: false,
            updateStatus: 'Scheduled',
            createdBy: clinic.createdBy,
            type: 'pharmacy'
        });

        await scheduleCall.save();
        res.status(201).json({ message: 'Pharmacy schedule call created successfully', scheduleCall });
    } catch (error) {
        console.error('Error creating pharmacy schedule call:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Both Doctor and Pharmacy Schedule Call
export const createBothScheduleCall = async (req, res) => {
    const { clinicId, date, time } = req.body;

    try {
        const clinic = await Clinic.findById(clinicId);
        if (!clinic || !clinic.doctorNumber || !clinic.pharmacyNumber) {
            return res.status(404).json({ message: 'Clinic not found or missing doctor/pharmacy number' });
        }

        const existingSchedule = await ScheduleCall.findOne({ date, time });
        if (existingSchedule) {
            return res.status(400).json({ message: 'A schedule call already exists for this date and time' });
        }

        const scheduleCall = new ScheduleCall({
            clinic: clinicId,
            date,
            time,
            reschedule: false,
            updateStatus: 'Scheduled',
            createdBy: clinic.createdBy,
            type: 'both'
        });

        await scheduleCall.save();
        res.status(201).json({ message: 'Both doctor and pharmacy schedule call created successfully', scheduleCall });
    } catch (error) {
        console.error('Error creating both schedule call:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reschedule Schedule Call
export const rescheduleScheduleCall = async (req, res) => {
    const { scheduleCallId, date, time } = req.body;

    try {
        // Find the schedule call by its ID
        const scheduleCall = await ScheduleCall.findById(scheduleCallId);
        if (!scheduleCall) {
            return res.status(404).json({ message: 'Schedule call not found' });
        }

        // Check if a ScheduleCall already exists for the same date and time
        const existingSchedule = await ScheduleCall.findOne({
            date,
            time,
            type: scheduleCall.type, // Use the type from the existing schedule
            _id: { $ne: scheduleCallId } // Exclude the current schedule from the check
        });
        if (existingSchedule) {
            return res.status(400).json({ message: 'A schedule call already exists for this date and time' });
        }

        // Update the schedule call but keep the createdBy field unchanged
        scheduleCall.date = date;
        scheduleCall.time = time;
        scheduleCall.reschedule = true;
        scheduleCall.createdBy = scheduleCall.createdBy; // Ensure createdBy is not removed

        await scheduleCall.save();

        res.status(200).json({ message: 'Schedule call rescheduled successfully', scheduleCall });
    } catch (error) {
        console.error('Error rescheduling schedule call:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Schedule Call Status
export const updateScheduleCall = async (req, res) => {
    const { scheduleCallId, updateStatus } = req.body;

    console.log(scheduleCallId, updateStatus)
    try {
        // Find the schedule call by its ID
        const scheduleCall = await ScheduleCall.findById(scheduleCallId);
        if (!scheduleCall) {
            return res.status(404).json({ message: 'Schedule call not found' });
        }

        // Update the status of the schedule call
        scheduleCall.updateStatus = updateStatus;

        await scheduleCall.save();

        res.status(200).json({ message: 'Schedule call status updated successfully', scheduleCall });
    } catch (error) {
        console.error('Error updating schedule call status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Today's Schedule Calls
export const getTodaysScheduleCalls = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of the day

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999); // End of the day

        const scheduleCalls = await ScheduleCall.find({
            date: { $gte: today, $lt: endOfDay }
        }).populate('clinic');

        const result = scheduleCalls.map(call => ({
            scheduleCallId: call._id,
            date: call.date,
            time: call.time,
            type: call.type,
            status: call.updateStatus,
            ...(call.type === 'doctor' || call.type === 'both' ? {
                doctorNumber: call.clinic.doctorNumber,
                dcotorName: call.clinic.doctorName
            } : {}),
            ...(call.type === 'pharmacy' || call.type === 'both' ? {
                pharmacyNumber: call.clinic.pharmacyNumber,
                pharmacyName: call.clinic.pharmacyName
            } : {})
        }))
        .sort((a, b) => {
            // Compare times first
            if (a.time !== b.time) {
                return a.time.localeCompare(b.time);
            }          
        });
        console.log(result)

        res.status(200).json({ scheduleCalls: result });
    } catch (error) {
        console.error('Error retrieving today\'s schedule calls:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Upcoming Schedule Calls
export const getUpcomingScheduleCalls = async (req, res) => {
    try {
        const today = new Date();
        const endOfToday = new Date(today.setHours(23, 59, 59, 999)); // End of the day

        const scheduleCalls = await ScheduleCall.find({
            date: { $gt: endOfToday }
        }).populate('clinic');

        // Log the raw data to debug the issue
        console.log('Raw Schedule Calls Data:', scheduleCalls);

        const result = scheduleCalls.map(call => ({
            scheduleCallId: call._id,
            date: call.date,
            time: call.time,
            type: call.type,
            status: call.updateStatus,
            ...(call.type === 'doctor' || call.type === 'both' ? {
                doctorNumber: call.clinic?.doctorNumber, // Use optional chaining to handle null values
                doctorName: call.clinic?.doctorName
            } : {}),
            ...(call.type === 'pharmacy' || call.type === 'both' ? {
                pharmacyNumber: call.clinic?.pharmacyNumber,
                pharmacyName: call.clinic?.pharmacyName
            } : {})
        }))
        .sort((a, b) => {
            // Compare times first
            if (a.time !== b.time) {
                return a.time.localeCompare(b.time);
            }
            // If times are the same, compare dates
            return new Date(a.date) - new Date(b.date);
        });
        console.log(result)

        res.status(200).json({ scheduleCalls: result });
    } catch (error) {
        console.error('Error retrieving upcoming schedule calls:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Schedule Calls with status 'Call Done'
export const getCompletedScheduleCalls = async (req, res) => {
    try {
        // Retrieve all schedule calls with status 'Call Done'
        const completedCalls = await ScheduleCall.find({ updateStatus: 'Call Done' })
            .populate('clinic', 'doctorName doctorNumber pharmacyName pharmacyNumber');

        res.status(200).json({ completedCalls });
    } catch (error) {
        console.error('Error retrieving completed schedule calls:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


