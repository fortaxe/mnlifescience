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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MR', required: true }
});

export default mongoose.model('Clinic', clinicSchema);
