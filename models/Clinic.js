import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
    doctorName:  String ,
    doctorNumber:  {
        type: Number,
        unique: true
    } ,
    speciality:  String ,
    pharmacyName:  String ,
    pharmacyNumber:   {
        type: Number,
        unique: true
    } ,
    areaName:  String ,
    pincode:  Number ,
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
});

export default mongoose.model('Clinic', clinicSchema);
