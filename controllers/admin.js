import MR from '../models/MR.js';
import Clinic from '../models/Clinic.js';
import ScheduleCall from "../models/ScheduleCall.js";

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

        // Convert doctorNumber and pharmacyNumber from string to number
        const doctorNumberParsed = doctorNumber ? Number(doctorNumber) : null;
        const pharmacyNumberParsed = pharmacyNumber ? Number(pharmacyNumber) : null;

        // Validate doctorNumber and pharmacyNumber
        if (doctorNumberParsed && (doctorNumberParsed < 1000000000 || doctorNumberParsed > 9999999999)) {
            return res.status(400).json({ message: 'Doctor number must be a 10-digit number' });
        }

        if (pharmacyNumberParsed && (pharmacyNumberParsed < 1000000000 || pharmacyNumberParsed > 9999999999)) {
            return res.status(400).json({ message: 'Pharmacy number must be a 10-digit number' });
        }
        
        // Check if doctorNumber already exists in another clinic
        if (doctorNumberParsed !== null && doctorNumberParsed !== clinic.doctorNumber) {
            const existingDoctor = await Clinic.findOne({ doctorNumber: doctorNumberParsed });
            if (existingDoctor) {
                return res.status(400).json({ message: 'Doctor number already exists' });
            }
        }

        // Check if pharmacyNumber already exists in another clinic
        if (pharmacyNumberParsed !== null && pharmacyNumberParsed !== clinic.pharmacyNumber) {
            const existingPharmacy = await Clinic.findOne({ pharmacyNumber: pharmacyNumberParsed });
            if (existingPharmacy) {
                return res.status(400).json({ message: 'Pharmacy number already exists' });
            }
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

export const getNotes = async (req, res) => {
    const { id } = req.body;

    try {
        // Find the schedule by its ID and populate the clinic details
        const schedule = await ScheduleCall.findById(id).populate('clinic'); // Assuming 'clinic' is the reference field

        // Check if the schedule exists
        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found!" });
        }

        // Check if the clinic exists in the schedule
        if (!schedule.clinic) {
            return res.status(404).json({ message: "Clinic not found for this schedule!" });
        }

        // Retrieve the notes from the clinic
        const clinicNotes = schedule.clinic.notes;

        // Send the response back with the clinic notes
        return res.status(200).json({ message: 'Clinic notes retrieved successfully', notes: clinicNotes });

    } catch (error) {
        console.error("Error retrieving clinic notes:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


//Edit the notes
export const editNotes = async (req, res) => {
    const { id, notes } = req.body;

    try {
        const schedule = await ScheduleCall.findById(id).populate("clinic");

        if (!schedule) {
            return res.status(404).json({ message: "schedule not found " })
        }

        // Check if the clinic exists in the schedule
        if (!schedule.clinic) {
            return res.status(404).json({ message: "Clinic not found for this schedule!" });
        }

        // Update the clinic notes
        schedule.clinic.notes = notes || schedule.clinic.notes;

        await schedule.clinic.save();

        return res.status(200).json({ message: "Clinic notes updated successfully", notes: schedule.clinic.notes });
    } catch (error) {
        console.error("Error updating clinic notes:", error);
        return res.status(500).json({ message: "Server error" });
    }


}