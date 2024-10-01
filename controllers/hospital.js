import Clinic from '../models/Clinic.js';
import MR from "../models/MR.js";

// Create Clinic/Lead Form Form
export const createHospital = async (req, res) => {
    // Fetch the MR (Medical Representative) making the request
    const mr = await MR.findById(req.user.id);

    // Check if the MR exists
    if (!mr) {
        return res.status(404).json({ message: "MR not found. You cannot create hospitals." });
    }

    // Check if the MR is archived
    if (mr.isArchived) {
        return res.status(403).json({ message: "You are archived and cannot create hospitals." });
    }

    if (!req.files || !req.files['doctorImage'] || req.files['doctorImage'].length === 0) {
        return res.status(400).json({ message: 'Doctor image is required' });
    }

    const { hospitalName, doctorName, doctorNumber, speciality, pharmacyName, pharmacyNumber, grade, remarks, areaName, url } = req.body;

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

         const doctorImage = req.files['doctorImage'][0].path;

        const clinic = new Clinic({
            hospitalName,
            doctorName,
            doctorNumber,
            speciality,
            pharmacyName,
            pharmacyNumber,
            grade,
            remarks,
            areaName,
            url,
            doctorImage,
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
    const mr = await MR.findById(req.user.id);

    if (!mr) {
        return res.status(404).json({ message: "MR not found." });
    }

    if (mr.isArchived) {
        return res.status(403).json({ message: "You are archived" });
    }

    try {
        // Fetch the MR document including the clinics array
        const mr = await MR.findById(req.user.id).populate({
            path: 'clinics',
            select: '-doctorWhatsAppContacted -pharmacyWhatsAppContacted' // Exclude these fields
        });

        // Return the clinics associated with the user
        res.status(200).json(mr.clinics);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

//Get Clinic in user panel
export const getHospital = async (req, res) => {
    const mr = await MR.findById(req.user.id);

    if (!mr) {
        return res.status(404).json({ message: "MR not found." });
    }

    if (mr.isArchived) {
        return res.status(403).json({ message: "You are archived" });
    }
    try {
        // Find the clinic by its ID
        const { id } = req.params;

        const clinic = await Clinic.findById(id).select('-doctorWhatsAppContacted -pharmacyWhatsAppContacted');

        if (!clinic) {
            return res.status(401).json({ msg: "Doctor not found!" })
        }

        // Return the clinic data
        return res.status(200).json(clinic);
    } catch (error) {
        return res.status(500).json({ message: "Server Error" })
    }
}

//Edit Clinic in user panel
export const editHospital = async (req, res) => {
    const mr = await MR.findById(req.user.id);

    if (!mr) {
        return res.status(404).json({ message: "MR not found." });
    }

    if (mr.isArchived) {
        return res.status(403).json({ message: "You are archived" });
    }
    const { hospitalName, doctorName, doctorNumber, pharmacyName, pharmacyNumber, grade, speciality, remarks, areaName } = req.body;
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
        clinic.hospitalName = hospitalName || clinic.hospitalName;
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

// Add a follow-up to a clinic
export const addFollowUp = async (req, res) => {
    const mr = await MR.findById(req.user.id);

    if (!mr) {
        return res.status(404).json({ message: "MR not found" });
    }

    if (mr.isArchived) {
        return res.status(403).json({ message: "You are archived" });
    }

    if (!req.files || !req.files['followUpImage'] || req.files['followUpImage'].length === 0) {
        return res.status(400).json({ message: 'Follow-up image is required' });
    }

    const { remarks, url } = req.body;
    const { id } = req.params;

    try {
        const clinic = await Clinic.findById(id);
        if (!clinic) {
            return res.status(404).json({ message: 'Clinic not found' });
        }

        const followUpImage = req.files['followUpImage'][0].path;

        // Add the new follow-up with current date
        clinic.followUps.push({
            remarks,
            url,
            date: new Date(),
            followUpImage
        });

        await clinic.save();
        res.status(201).json({ message: 'Follow-up added successfully' });
    } catch (error) {
        console.error('Error adding follow-up:', error);
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