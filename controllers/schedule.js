import ScheduleCall from "../models/ScheduleCall.js";
import Clinic from "../models/Clinic.js";

import { startOfDay, endOfDay } from 'date-fns';
import * as dateFnsTz from 'date-fns-tz';

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
        res.status(201).json({ message: 'Doctor schedule call created successfully' });
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
        res.status(201).json({ message: 'Pharmacy schedule call created successfully' });
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
        const TIMEZONE = 'Asia/Kolkata';  // Or your preferred timezone
        const now = new Date();
        const zonedNow = dateFnsTz.toZonedTime(now, TIMEZONE);
        const todayStart = dateFnsTz.toZonedTime(startOfDay(dateFnsTz.fromZonedTime(zonedNow, TIMEZONE)), TIMEZONE);
        const todayEnd = dateFnsTz.toZonedTime(endOfDay(dateFnsTz.fromZonedTime(zonedNow, TIMEZONE)), TIMEZONE);

        console.log('Today Start:', todayStart.toISOString());
        console.log('Today End:', todayEnd.toISOString());


        const scheduleCalls = await ScheduleCall.aggregate([
            {
                $match: {
                    date: { $gte: todayStart, $lt: todayEnd },
                    type: { $in: ['doctor', 'pharmacy'] }
                }
            },
            {
                $lookup: {
                    from: 'clinics', // Collection to join
                    localField: 'clinic',
                    foreignField: '_id',
                    as: 'clinicDetails'
                }
            },
            {
                $unwind: '$clinicDetails' // Decompose array to single object
            },
            {
                $project: {
                    scheduleCallId: '$_id',
                    date: 1,
                    time: 1, // Time as a Date
                    type: 1,
                    status: '$updateStatus',
                    doctorNumber: {
                        $cond: {
                            if: { $eq: ['$type', 'doctor'] },
                            then: '$clinicDetails.doctorNumber',
                            else: null
                        }
                    },
                    doctorName: {
                        $cond: {
                            if: { $eq: ['$type', 'doctor'] },
                            then: '$clinicDetails.doctorName',
                            else: null
                        }
                    },
                    pharmacyNumber: {
                        $cond: {
                            if: { $eq: ['$type', 'pharmacy'] },
                            then: '$clinicDetails.pharmacyNumber',
                            else: null
                        }
                    },
                    pharmacyName: {
                        $cond: {
                            if: { $eq: ['$type', 'pharmacy'] },
                            then: '$clinicDetails.pharmacyName',
                            else: null
                        }
                    }
                }
            },
            {
                $sort: {
                    time: 1 // Sort by time in ascending order
                }
            }
        ]);

        
        console.log('Number of schedule calls found:', scheduleCalls.length);
        if (scheduleCalls.length > 0) {
            console.log('First schedule call:', JSON.stringify(scheduleCalls[0], null, 2));
        } else {
            console.log('No schedule calls found for today');
        }

        res.status(200).json({ scheduleCalls: scheduleCalls });
    } catch (error) {
        console.error('Error retrieving today\'s schedule calls:', error);
        res.status(500).json({ message: 'Server error' });
    }
};               

// Get Upcoming Schedule Calls
export const getUpcomingScheduleCalls = async (req, res) => {
    try {
        const now = new Date();
        const todayEnd = endOfDay(fromZonedTime(now, TIMEZONE));


        const upcomingScheduleCalls = await ScheduleCall.aggregate([
            {
                $match: {
                    date: { $gt: todayEnd }, // Match schedules after today
                    type: { $in: ['doctor', 'pharmacy'] } // Only match 'doctor' or 'pharmacy'
                }
            },
            {
                $lookup: {
                    from: 'clinics', // Collection to join
                    localField: 'clinic',
                    foreignField: '_id',
                    as: 'clinicDetails'
                }
            },
            {
                $unwind: '$clinicDetails' // Decompose array to single object
            },
            {
                $project: {
                    scheduleCallId: '$_id',
                    date: 1,
                    time: 1, // Time as a Date
                    type: 1,
                    status: '$updateStatus',
                    doctorNumber: {
                        $cond: {
                            if: { $eq: ['$type', 'doctor'] },
                            then: '$clinicDetails.doctorNumber',
                            else: null
                        }
                    },
                    doctorName: {
                        $cond: {
                            if: { $eq: ['$type', 'doctor'] },
                            then: '$clinicDetails.doctorName',
                            else: null
                        }
                    },
                    pharmacyNumber: {
                        $cond: {
                            if: { $eq: ['$type', 'pharmacy'] },
                            then: '$clinicDetails.pharmacyNumber',
                            else: null
                        }
                    },
                    pharmacyName: {
                        $cond: {
                            if: { $eq: ['$type', 'pharmacy'] },
                            then: '$clinicDetails.pharmacyName',
                            else: null
                        }
                    }
                }
            },
            {
                $sort: { date: 1, time: 1 } // Sort by 'date' and then by 'time' (ascending)
            }
        ]);

        res.status(200).json({ scheduleCalls: upcomingScheduleCalls });
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


