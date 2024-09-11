import MR from '../models/MR.js';
import Clinic from '../models/Clinic.js';

// Get all MRs (for Admin Dashboard)
export const getAllMRs = async (req, res) => {
    try {
        const mrs = await MR.find({ role: 'mr' }).select('-password'); // Exclude passwords
        res.status(200).json(mrs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all Clinics/Lead Forms (for Admin Dashboard)
export const getAllClinics = async (req, res) => {
    try {
        const clinics = await Clinic.find().populate('createdBy', 'name email'); // Populate MR info
        res.status(200).json(clinics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Doctor Meeting & Lead Form Priority
export const adminEditClinic = async (req, res) => {
    const { id, meetingStatus, leadPriority } = req.body; 

    try {
        // Find the clinic by its ID
        const clinic = await Clinic.findById(id);

        if (!clinic) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Update only meetingStatus and leadPriority by admin
        clinic.meetingStatus = meetingStatus || clinic.meetingStatus;
        clinic.leadPriority = leadPriority || clinic.leadPriority;

        await clinic.save();

        res.status(200).json({ message: 'Clinic updated successfully', clinic });
    } catch (error) {
        console.error('Error updating clinic:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

