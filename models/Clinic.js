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
    speciality:{
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
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        }
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
    }
},
{ timestamps: true }
);

// Middleware to delete related ScheduleCall when a clinic is deleted
clinicSchema.pre("findOneAndDelete", async function (next) {
    try {
        const clinicId = this.getQuery()._id;
        await ScheduleCall.deleteMany({ clinic: clinicId });  // Remove all schedules related to the clinic
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('Clinic', clinicSchema);
