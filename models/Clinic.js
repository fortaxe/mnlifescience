import mongoose from 'mongoose';

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
        },
        coordinates: {
            type: [Number], 
        },
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

export default mongoose.model('Clinic', clinicSchema);
