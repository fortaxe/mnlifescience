import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from 'dotenv';
import Clinic from "../models/Clinic.js";
import MR from "../models/MR.js";

dotenv.config(); 

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: "mr-documents", // Folder name in Cloudinary
        allowed_formats: ["jpg", "png", "jpeg", "pdf"], // Allowed formats
    },
});

export const upload = multer({ storage });

export const adminDeleteClinic = async (req, res) => {
    try {
        const { id } = req.body;

        // Find the clinic in the database
        const clinic = await Clinic.findById(id);
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found" });
        }

        console.log(`Clinic doctor image URL: ${clinic.doctorImage}`);

        // Delete image from Cloudinary if it exists
        if (clinic.doctorImage) {
            // Extract the public ID including the folder name
            const urlParts = clinic.doctorImage.split('/');
            const folderAndFile = urlParts.slice(-2).join('/'); // Gets last two parts of the URL
            const publicId = folderAndFile.split('.')[0]; // Remove file extension

            console.log(`Attempting to delete image with public ID: ${publicId}`);

            try {
                const deletionResult = await cloudinary.v2.uploader.destroy(publicId);
                console.log(`Cloudinary deletion result:`, deletionResult);

                if (deletionResult.result === 'ok') {
                    console.log(`Doctor image deleted successfully from Cloudinary.`);
                } else if (deletionResult.result === 'not found') {
                    console.log(`Doctor image not found in Cloudinary. It may have been deleted already.`);
                } else {
                    console.error(`Unexpected result from Cloudinary deletion:`, deletionResult);
                }
            } catch (cloudinaryError) {
                console.error(`Error deleting doctor image from Cloudinary:`, cloudinaryError);
            }
        }

         // Loop through the followUps array and delete each followUpImage from Cloudinary
         for (const followUp of clinic.followUps) {
            if (followUp.followUpImage) {
                // Extract the public ID from the followUpImage URL
                const urlParts = followUp.followUpImage.split('/');
                const folderAndFile = urlParts.slice(-2).join('/');
                const publicId = folderAndFile.split('.')[0];

                console.log(`Attempting to delete follow-up image with public ID: ${publicId}`);

                try {
                    const deletionResult = await cloudinary.v2.uploader.destroy(publicId);
                    console.log(`Cloudinary deletion result for follow-up image:`, deletionResult);

                    if (deletionResult.result === 'ok') {
                        console.log(`Follow-up image deleted successfully from Cloudinary.`);
                    } else if (deletionResult.result === 'not found') {
                        console.log(`Follow-up image not found in Cloudinary. It may have been deleted already.`);
                    } else {
                        console.error(`Unexpected result from Cloudinary deletion for follow-up image:`, deletionResult);
                    }
                } catch (cloudinaryError) {
                    console.error(`Error deleting follow-up image from Cloudinary:`, cloudinaryError);
                }
            }
        }

        // Delete clinic from the database
        const deletedClinic = await Clinic.findByIdAndDelete(id);
        if (deletedClinic) {
            console.log(`Clinic with ID ${id} deleted successfully from the database.`);
            res.status(200).json({ message: "Clinic deleted successfully" });
        } else {
            console.log(`Clinic with ID ${id} not found in the database during deletion.`);
            res.status(404).json({ message: "Clinic not found during deletion" });
        }
    } catch (err) {
        console.error('Error deleting clinic:', err);
        res.status(500).json({ error: err.message });
    }
};

// Delete MR
export const deleteMR = async (req, res) => {
    try {
        const { id } = req.body;

        // Check if the MR exists in the database
        const mr = await MR.findById(id);
        if (!mr) {
            return res.status(404).json({ message: "MR not found" });
        }

        // Delete aadhaarCard image from Cloudinary if it exists
        if (mr.aadhaarCard) {
            const urlParts = mr.aadhaarCard.split('/');
            const folderAndFile = urlParts.slice(-2).join('/'); // Extract folder and filename
            const publicId = folderAndFile.split('.')[0]; // Remove file extension

            console.log(`Attempting to delete Aadhaar card image with public ID: ${publicId}`);

            try {
                const deletionResult = await cloudinary.v2.uploader.destroy(publicId);
                console.log(`Aadhaar card image deletion result:`, deletionResult);

                if (deletionResult.result === 'ok') {
                    console.log(`Aadhaar card image deleted successfully from Cloudinary.`);
                } else if (deletionResult.result === 'not found') {
                    console.log(`Aadhaar card image not found in Cloudinary. It may have been deleted already.`);
                } else {
                    console.error(`Unexpected result from Cloudinary Aadhaar card deletion:`, deletionResult);
                }
            } catch (cloudinaryError) {
                console.error(`Error deleting Aadhaar card image from Cloudinary:`, cloudinaryError);
            }
        }

        // Delete panCard image from Cloudinary if it exists
        if (mr.panCard) {
            const urlParts = mr.panCard.split('/');
            const folderAndFile = urlParts.slice(-2).join('/'); // Extract folder and filename
            const publicId = folderAndFile.split('.')[0]; // Remove file extension

            console.log(`Attempting to delete PAN card image with public ID: ${publicId}`);

            try {
                const deletionResult = await cloudinary.v2.uploader.destroy(publicId);
                console.log(`PAN card image deletion result:`, deletionResult);

                if (deletionResult.result === 'ok') {
                    console.log(`PAN card image deleted successfully from Cloudinary.`);
                } else if (deletionResult.result === 'not found') {
                    console.log(`PAN card image not found in Cloudinary. It may have been deleted already.`);
                } else {
                    console.error(`Unexpected result from Cloudinary PAN card deletion:`, deletionResult);
                }
            } catch (cloudinaryError) {
                console.error(`Error deleting PAN card image from Cloudinary:`, cloudinaryError);
            }
        }

        // Delete MR from the database
        await MR.findByIdAndDelete(id);
        res.status(200).json({ message: "MR deleted successfully", id: mr._id });
    } catch (error) {
        console.error('Error deleting MR:', error);
        res.status(500).json({ error: "Server error" });
    }
};

