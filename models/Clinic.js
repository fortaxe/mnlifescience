import mongoose from 'mongoose';
import ScheduleCall from "./ScheduleCall.js";

const clinicSchema = new mongoose.Schema({
    doctorName: {
        type: String,
        required: true,
    },
    doctorNumber: {
        type: String,
        unique: true,
        required: true,
    },
    speciality: {
        type: String,
    },
    doctorWhatsAppContacted: {
        type: Boolean,
        default: false,
    },
    pharmacyName: String,
    pharmacyNumber: {
        type: String,
        unique: true,
    },
    pharmacyWhatsAppContacted: {
        type: Boolean,
        default: false,
    },
    grade: String,
    url: {
        type: String
    },
    remarks: String,
    notes: {
        type: String,
        default: '',
    },
    areaName: {
        type: String
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MR', required: true },
    isArchived: {
        type: Boolean,
        default: false, // Default to false, meaning the clinic is active
    },
    followUps: [{
        followUpDate: { type: Date, default: Date.now },
        remarks: { type: String, required: true },
        url: { type: String }
    }],
},
    { timestamps: true }
);

export default mongoose.model('Clinic', clinicSchema);
