import mongoose from 'mongoose';
import ScheduleCall from "./ScheduleCall.js";

const clinicSchema = new mongoose.Schema({
    hospitalName: {
        type: String
    },
    doctorName: {
        type: String,
    },
    doctorNumber: {
        type: String,
        unique: true,
        sparse: true,
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
        sparse: true,
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
        remarks: { type: String },
        url: { type: String },
        followUpImage: { type: String },
    }],
    doctorImage: {
        type: String,
    }
},
    { timestamps: true }
);

clinicSchema.pre("findOneAndDelete", async function (next) {
    try {
      const clinic = await this.model.findOne(this.getFilter());
      if (clinic) {
        await ScheduleCall.deleteMany({ clinic: clinic._id });
        console.log(`Deleted all schedule calls related to clinic ${clinic._id}`);
      }
      next();
    } catch (err) {
      next(err);
    }
  });

export default mongoose.model('Clinic', clinicSchema);

