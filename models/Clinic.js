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
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    remarks: String,
    notes: {
        type: String,
        default: '', 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MR', required: true },
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
