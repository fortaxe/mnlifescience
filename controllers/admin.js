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
        const clinics = await Clinic.find().populate('createdBy', 'name mobileNumber'); // Populate MR info
        res.status(200).json(clinics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update Clinic in Admin
export const adminEditClinic = async (req, res) => {
    const { id, doctorName, doctorNumber, pharmacyName, pharmacyNumber, grade, location, remarks, notes, doctorWhatsAppContacted, pharmacyWhatsAppContacted } = req.body;

    try {
        // Find the clinic by its ID
        const clinic = await Clinic.findById(id);
        if (!clinic) {
            return res.status(404).json({ message: 'Clinic not found' });
        }

        // Update clinic details
        clinic.doctorName = doctorName || clinic.doctorName;
        clinic.doctorNumber = doctorNumber || clinic.doctorNumber;
        clinic.pharmacyName = pharmacyName || clinic.pharmacyName;
        clinic.pharmacyNumber = pharmacyNumber || clinic.pharmacyNumber;
        clinic.grade = grade || clinic.grade;
        clinic.location = location || clinic.location;
        clinic.remarks = remarks || clinic.remarks;
        clinic.notes = notes || clinic.notes;
        clinic.doctorWhatsAppContacted = doctorWhatsAppContacted !== undefined ? doctorWhatsAppContacted : clinic.doctorWhatsAppContacted;
        clinic.pharmacyWhatsAppContacted = pharmacyWhatsAppContacted !== undefined ? pharmacyWhatsAppContacted : clinic.pharmacyWhatsAppContacted;

        await clinic.save();
        res.status(200).json({ message: 'Clinic updated successfully', clinic });
    } catch (error) {
        console.error('Error updating clinic:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
