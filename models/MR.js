import mongoose from 'mongoose';

const mrSchema = new mongoose.Schema({
    name: { type: String },
    
    // For MR: mobileNumber is required and unique
    mobileNumber: {
        type: String,
        unique: true,
        sparse: true, 
        validate: {
            validator: function (v) {
                return this.role === 'mr' ? !!v : true;
            },
            message: 'Mobile number is required for MR'
        }
    },
    
    // For Admin: email is required and unique
    email: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function (v) {
                return this.role === 'admin' ? !!v : true;
            },
            message: 'Email is required for Admin'
        }
    },
    
    password: {
        type: String,
        required: true
    },
    
    areaName: { type: String },
    
    joiningDate: {
        type: Date,
        default: Date.now
    },
    
    clinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
    
    role: { 
        type: String, 
        enum: ['admin', 'mr'], 
        default: 'mr' 
    }, // Distinguishes between admin and MR
    aadhaarCard: { 
        type: String,
        default: null
    },
    panCard: { 
        type: String,
        default: null 
    },
    status: {
        type: String,
        enum: ['Active', 'In-Active'], 
        default: "Active"
    }
},
{ timestamps: true });

export default mongoose.model('MR', mrSchema);
