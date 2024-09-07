import mongoose from 'mongoose';

const mrSchema = new mongoose.Schema({
    name: String,
    email: { 
        type: String, 
        unique: true,
        required: true 
    },
    password: String,
   
    area: String,
    code: String,
    clinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
    role: { type: String, enum: ['admin', 'mr'], default: 'mr' }, // role field to distinguish between admin and MR
});

export default mongoose.model('MR', mrSchema);
