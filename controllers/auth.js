import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import MR from '../models/MR.js';
import fs from 'fs'; 

// Admin Signin
export const adminSignin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin exists
        const admin = await MR.findOne({ email, role: 'admin' });
        if (!admin) {
            return res.status(400).send('Invalid credentials');
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
        res.send({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// MR (User) Signin
export const mrSignin = async (req, res) => {
    try {
        const { mobileNumber, password } = req.body;

        const mobileNumberStr = String(mobileNumber);
        const mr = await MR.findOne({ mobileNumber: mobileNumberStr, role: 'mr' }).populate("clinics");

        console.log(mr)
        if (!mr || !(await bcrypt.compare(password, mr.password))) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: mr._id, role: 'mr' }, process.env.JWT_SECRET);
        res.send({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createMR = async (req, res) => {
    try {
        const { name, mobileNumber, password, confirmPassword, areaName, joiningDate } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const mobileNumberStr = String(mobileNumber);

        const existingMR = await MR.findOne({ mobileNumber: mobileNumberStr });
        console.log('Searching for MR with mobileNumber:', mobileNumber);
        if (existingMR) {
            console.log('Existing MR found:', existingMR);
            return res.status(400).send('An MR with this mobile number already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Access the uploaded files URLs
        const aadhaarCard = req.files?.['aadhaarCard']?.[0]?.path || null;  // Use optional chaining
        const panCard = req.files?.['panCard']?.[0]?.path || null;

        const newMR = new MR({
            name,
            mobileNumber: mobileNumberStr,
            password: hashedPassword,
            areaName,
            joiningDate: new Date(joiningDate),
            role: 'mr',
            aadhaarCard,
            panCard
        });

        await newMR.save();
        return res.status(201).json({ message: 'MR created successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// Edit MR
// export const editMR = async (req, res) => {
//     try {
//         const { id, name, mobileNumber, newPassword, confirmPassword, areaName, joiningDate,status } = req.body;

//         // Validate input
//         if (!id) {
//             return res.status(400).json({ message: "MR ID is required" });
//         }

//         // Find MR by ID
//         const mr = await MR.findById(id);
//         if (!mr) {
//             return res.status(404).json({ message: 'MR not found' });
//         }

//          // Check if passwords match
//          if (newPassword !== confirmPassword) {
//             return res.status(400).json({ message: "Passwords do not match" });
//         }

//         // If a new password is provided, hash it and update
//         if (newPassword) {
//             const hashedPassword = await bcrypt.hash(newPassword, 10);
//             mr.password = hashedPassword;
//             mr.markModified("password")
//             console.log("Password updated:", hashedPassword);
//         }

//         // Update MR details
//         mr.name = name || mr.name;
//         mr.mobileNumber = mobileNumber ? String(mobileNumber) : mr.mobileNumber;
//         mr.areaName = areaName || mr.areaName;
//         mr.joiningDate = joiningDate ? new Date(joiningDate) : mr.joiningDate;

//         // // Update Aadhaar and PAN card if new files are uploaded
//         // const aadhaarCard = req.files['aadhaarCard'] ? req.files['aadhaarCard'][0].path : mr.aadhaarCard;
//         // const panCard = req.files['panCard'] ? req.files['panCard'][0].path : mr.panCard;

//         // mr.aadhaarCard = aadhaarCard;
//         // mr.panCard = panCard;

//         // Save updated MR
//         const savedMR = await mr.save();
//         console.log("Updated MR:", savedMR);
//         console.log(mr.save())
//         res.status(200).json({ message: 'MR updated successfully', mr });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

export const editMR = async (req, res) => {
    try {
        const { id, name, mobileNumber, newPassword, confirmPassword, areaName, joiningDate, status } = req.body;

        // Validate input
        if (!id) {
            return res.status(400).json({ message: "MR ID is required" });
        }

        // Find MR by ID
        const mr = await MR.findById(id);
        if (!mr) {
            return res.status(404).json({ message: 'MR not found' });
        }

         // Check if new mobile number already exists in DB for another MR
         if (mobileNumber && String(mobileNumber) !== mr.mobileNumber) {
            const existingMR = await MR.findOne({ mobileNumber: String(mobileNumber),_id: { $ne: id } });
            if (existingMR) {
                return res.status(400).json({ message: 'Mobile number already in use by another MR' });
            }
        }

        // Check if passwords match
        if (newPassword && newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // If a new password is provided, hash it and update
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            mr.password = hashedPassword; // Update password
            mr.markModified("password");  // Ensure password field is treated as modified
        }

        // Update other MR details
        mr.name = name || mr.name;
        mr.mobileNumber = mobileNumber ? String(mobileNumber) : mr.mobileNumber;
        mr.areaName = areaName || mr.areaName;
        mr.joiningDate = joiningDate ? new Date(joiningDate) : mr.joiningDate;
        mr.status = status || mr.status;

        // Save the updated MR
        const savedMR = await mr.save(); // Await the save operation
        console.log("Updated MR:", savedMR);

        res.status(200).json({ message: 'MR updated successfully', mr: savedMR });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete MR
export const deleteMR = async (req, res) => {
    try {
        const { id } = req.body;

        // Find MR by ID and archive it
        const archivedMR = await MR.findByIdAndUpdate(
            id,
            { isArchived: true },
            { new: true }
        );

        if (!archivedMR) {
            return res.status(404).send('MR not found');
        }

        res.status(200).send('MR archived successfully');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Admin (used only once)
export const createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if an admin already exists
        const existingAdmin = await MR.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin account already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin
        const admin = new MR({ email, password: hashedPassword, role: 'admin' });

        // Save the admin
        await admin.save();
        res.status(201).json('Admin created successfully');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Edit Admin Email and Password
export const editAdmin = async (req, res) => {
    try {
        const { id: adminId } = req.params; // Get admin ID from request params
        const { newEmail, newPassword, confirmPassword } = req.body;

        // Check if passwords match
        if (newPassword &&newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Find the admin by ID
        const admin = await MR.findOne({ _id: adminId, role: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Hash the new password if provided
        if (newPassword) {
            admin.password = await bcrypt.hash(newPassword, 10);
        }

        // Update the admin's email if provided
        admin.email = newEmail || admin.email;

        // Save the updated admin
        await admin.save();
        res.status(200).json({ message: 'Admin email and password updated successfully' });
    } catch (err) {
        console.error('Error updating admin email and password:', err);
        res.status(500).json({ error: err.message });
    }
};


export const updateAadhaarCard = async (req, res) => {
    try {
        console.log("Incoming request for Aadhaar card update:", req.body, req.files);
        const { mrId } = req.body;  // Get MR ID from params
        console.log("MR ID:", mrId);

        // Check if a new Aadhaar card image is provided
        const aadhaarCard = req.files?.['aadhaarCard']?.[0]?.path || null;
        console.log("Aadhaar card path:", aadhaarCard);

        const existingMR = await MR.findById(mrId);
        if (!existingMR) {
            console.log("MR not found for ID:", mrId);
            return res.status(404).json({ message: "MR not found" });
        }

        // Only update Aadhaar card if a new image is provided
        if (aadhaarCard) {
            existingMR.aadhaarCard = aadhaarCard;
            console.log("Aadhaar card updated to:", aadhaarCard);
        }

        await existingMR.save();
        console.log("MR saved successfully:", existingMR);
        return res.status(200).json({ message: 'Aadhaar card updated successfully' });
    } catch (err) {
        console.error("Error updating Aadhaar card:", err);
        res.status(500).json({ error: err.message });
    }
};

export const editPanCard = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        console.log("Received files:", req.files);
        
        const { mrId } = req.body;
        console.log("MR ID:", mrId);
        const panCard = req.files?.['panCard']?.[0]?.path || null;
        console.log("PAN card path:", panCard);

        const mr = await MR.findById(mrId);
        if (!mr) {
            console.log("MR not found for ID:", mrId);
            return res.status(404).json({ message: "MR not found" });
        }

        // If PAN image is provided, update it; otherwise, leave it unchanged.
        if (panCard) {
            mr.panCard = panCard;
            console.log("PAN card updated to:", panCard);
        }

        await mr.save();
        console.log("MR saved successfully:", mr);
        return res.status(200).json({ message: 'PAN card updated successfully' });
    } catch (err) {
        console.error("Error updating PAN card:", err);
        return res.status(500).json({ error: err.message });
    }
};
