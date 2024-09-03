import Clinic from '../models/Clinic.js';

// Create Clinic/Lead Form
export const createClinic = async (req, res) => {
    const { doctorName, doctorNumber, speciality, pharmacyName, pharmacyNumber, areaName, pincode } = req.body;

    // Validation checks for pincode and phone numbers
    if (pincode < 100000 || pincode > 999999) {
        return res.status(400).json({ message: 'Pincode must be a 6-digit number' });
    }

    if (doctorNumber < 1000000000 || doctorNumber > 9999999999) {
        return res.status(400).json({ message: 'Doctor number must be a 10-digit number' });
    }

    if (pharmacyNumber && (pharmacyNumber < 1000000000 || pharmacyNumber > 9999999999)) {
        return res.status(400).json({ message: 'Pharmacy number must be a 10-digit number' });
    }

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
            areaName,
            pincode,
            createdBy: req.user.id
        });

        await clinic.save();
        res.status(201).json({ message: 'Clinic created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
