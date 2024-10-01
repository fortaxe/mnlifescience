import { upload } from "../utils/cloudinary.js";

// Multer middleware for file upload
export const uploadDocuments = upload.fields([
    { name: "aadhaarCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
]);

// Multer middleware for file upload
export const uploadDoctorImage = upload.fields([
    { name: "doctorImage", maxCount: 1 } // Adjust the field name as needed
]);

// Multer middleware for follow-up image upload
export const uploadFollowUpImage = upload.fields([
    { name: "followUpImage", maxCount: 1 } // Allows only one image for the follow-up
]);
