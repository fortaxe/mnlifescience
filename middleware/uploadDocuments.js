import { upload } from "../utils/cloudinary.js";

// Multer middleware for file upload
export const uploadDocuments = upload.fields([
    { name: "aadhaarCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
]);