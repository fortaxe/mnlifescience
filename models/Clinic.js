import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
    doctorName: {
        type: String,
        required: true
    },
    doctorNumber:  {
        type: Number,
        unique: true,
        required: true
    } ,
    speciality:  {
        type: String,
        required: true
    },
    pharmacyName:  String ,
    pharmacyNumber:  {
        type: Number,
        unique: true
    },
    areaName:  String ,
    pincode: {
        type: Number,
        required: true
    },
    meetingStatus: { 
        type: String, 
        enum: ['1st Meeting', 'Whatsapp Contacted', 'Call Scheduled', 'Product Enquired', 'Product Delivered'], 
        default: '1st Meeting' 
    },
    leadPriority: { 
        type: String, 
        enum: ['Hot', 'Warm', 'Cold'], 
        default: 'Cold' 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MR', required: true }
},
{ timestamps: true } 
);

export default mongoose.model('Clinic', clinicSchema);
