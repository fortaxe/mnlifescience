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
    const  { doctorName, doctorNumber, pharmacyName, pharmacyNumber, grade, location, speciality, remarks, areaName }  = req.body;
    const { id } = req.params;

    try {
        const clinic = await Clinic.findById(id);

        if (!clinic) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Check for duplicate doctorNumber or pharmacyNumber
        if (doctorNumber && doctorNumber !== clinic.doctorNumber) {
            const existingDoctor = await Clinic.findOne({ doctorNumber });
            if (existingDoctor) {
                return res.status(400).json({ message: 'Another doctor with this doctor number already exists' });
            }
        }

        if (pharmacyNumber && pharmacyNumber !== clinic.pharmacyNumber) {
            const existingPharmacy = await Clinic.findOne({ pharmacyNumber });
            if (existingPharmacy) {
                return res.status(400).json({ message: 'Another pharmacy with this number already exists' });
            }
        }


        // Using findByIdAndUpdate to update the clinic
        await Clinic.findByIdAndUpdate(id, {
            doctorName,
            doctorNumber,
            speciality,
            pharmacyName,
            pharmacyNumber,
            grade,
            location,
            remarks,
            areaName
        }, { new: true }); // Returns the updated document

        res.status(200).json({ message: 'Clinic updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

