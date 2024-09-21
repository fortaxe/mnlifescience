import Clinic from '../models/Clinic.js';
import MR from "../models/MR.js";

// Create Clinic/Lead Form
export const createHospital = async (req, res) => {
    const { doctorName, doctorNumber,speciality, pharmacyName, pharmacyNumber, grade, location, remarks,areaName } = req.body;

    try {
        const existingDoctor = await Clinic.findOne({ doctorNumber });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Doctor with this number already exists' });
        }

        if (pharmacyNumber) {
            const existingPharmacy = await Clinic.findOne({ pharmacyNumber });
            if (existingPharmacy) {
                return res.status(400).json({ message: 'Pharmacy with this number already exists' });
            }
        }

        const clinic = new Clinic({
            doctorName,
            doctorNumber,
            speciality,
            pharmacyName,
            pharmacyNumber,
            grade,
            location,
            remarks,
            areaName,
            createdBy: req.user.id
        });

        await clinic.save();

         // Append the newly created clinic's ID to the MR's clinics array
         await MR.findByIdAndUpdate(req.user.id, { $push: { clinics: clinic._id } });
        res.status(201).json({ clinic });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all clinics in user panel
export const getAllClinics = async (req, res) => {
    try {
        // Fetch the MR document including the clinics array
        const mr = await MR.findById(req.user.id).populate({
            path: 'clinics',
            select: '-doctorWhatsAppContacted -pharmacyWhatsAppContacted' // Exclude these fields
        });

        if (!mr) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the clinics associated with the user
        res.status(200).json(mr.clinics);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

//Get Clinic in user panel
export const getHospital = async (req, res) => {
    try {
        // Find the clinic by its ID
        const { id } = req.params;

        const clinic = await Clinic.findById(id).select('-doctorWhatsAppContacted -pharmacyWhatsAppContacted');
    
        if (!clinic) {
            return res.status(401).json({ msg: "Doctor not found!"})
        }

        // Return the clinic data
        return res.status(200).json(clinic);
    } catch (error) {
        return res.status(500).json({ message: "Server Error"})
    }
}

//Edit Clinic in user panel
export const editHospital = async (req, res) => {
    const { doctorName, doctorNumber, pharmacyName, pharmacyNumber, grade, speciality, remarks, areaName } = req.body;
    const { id } = req.params;

    try {
        const clinic = await Clinic.findById(id);

        if (!clinic) {
            return res.status(404).json({ message: 'Clinic not found' });
        }

        // Check for duplicate doctorNumber or pharmacyNumber
        if (doctorNumber && doctorNumber !== clinic.doctorNumber) {
            const existingDoctor = await Clinic.findOne({ doctorNumber, _id: { $ne: id } });
            if (existingDoctor) {
                return res.status(400).json({ message: 'Another doctor with this doctor number already exists' });
            }
        }

        if (pharmacyNumber && pharmacyNumber !== clinic.pharmacyNumber) {
            const existingPharmacy = await Clinic.findOne({ pharmacyNumber, _id: { $ne: id } });
            if (existingPharmacy) {
                return res.status(400).json({ message: 'Another pharmacy with this number already exists' });
            }
        }

        // Update the fields only if provided in the request body
        clinic.doctorName = doctorName || clinic.doctorName;
        clinic.doctorNumber = doctorNumber || clinic.doctorNumber;
        clinic.pharmacyName = pharmacyName || clinic.pharmacyName;
        clinic.pharmacyNumber = pharmacyNumber || clinic.pharmacyNumber;
        clinic.grade = grade || clinic.grade;
        clinic.speciality = speciality || clinic.speciality;
        clinic.remarks = remarks || clinic.remarks;
        clinic.areaName = areaName || clinic.areaName;

        // Save the updated clinic document
        await clinic.save();

        res.status(200).json({ message: 'Clinic updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// export const forgotPasswordMR = async (req, res) => {
//     const { mobileNumber, newPassword, confirmPassword } = req.body;

//     try {
//         // Find the MR by mobile number
//         const mr = await MR.findOne({ mobileNumber });
//         if (!mr) {
//             return res.status(404).json({ message: "MR not found" });
//         }

//         // Check if passwords match
//         if (newPassword && newPassword !== confirmPassword) {
//             return res.status(400).json({ message: "Passwords do not match" });
//         }

//         // Hash the new password if provided
//         if (newPassword) {
//             mr.password = await bcrypt.hash(newPassword, 10);
//         }

//         // Save the updated MR
//         await mr.save();
//         res.status(200).json({ message: 'MR password updated successfully' });
//     } catch (err) {
//         console.error('Error updating MR password:', err);
//         res.status(500).json({ error: err.message });
//     }
// };