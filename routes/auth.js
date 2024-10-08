import express from 'express';
import { adminSignin, mrSignin, createMR, createAdmin, editMR, editAdmin, updateAadhaarCard, editPanCard, unarchiveMR, getArchivedMRs, archiveMR } from '../controllers/auth.js';
import authMiddleware from '../middleware/auth.js';
import { uploadDocuments } from "../middleware/uploadDocuments.js";
import { get } from "mongoose";
import { deleteMR } from "../utils/cloudinary.js";

const router = express.Router();

router.post('/admin/signin', adminSignin);
router.post('/user/signin', mrSignin);
router.post('/admin/create-mr', authMiddleware('admin'),uploadDocuments, createMR);
router.post('/admin/create', createAdmin);
router.patch('/admin/edit-mr', authMiddleware('admin'),editMR);
router.post('/admin/archive-mr', authMiddleware('admin'), archiveMR);
router.patch("/admin/edit/:id", authMiddleware("admin"), editAdmin);
router.patch('/admin/update-aadhaar', authMiddleware('admin'), uploadDocuments, updateAadhaarCard);

router.patch('/admin/update-pan', authMiddleware('admin'),uploadDocuments, editPanCard);
router.post("/admin/unarchive-mr", authMiddleware("admin"), uploadDocuments, unarchiveMR);
router.get("/admin/get-archived-mrs", authMiddleware("admin"), getArchivedMRs);
router.delete('/admin/delete-mr', authMiddleware('admin'), deleteMR);

export default router;
