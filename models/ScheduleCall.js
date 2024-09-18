import mongoose from 'mongoose';

const scheduleCallSchema = new mongoose.Schema({
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    reschedule: { type: Boolean, default: false },
    updateStatus: { type: String, enum: ['Scheduled', 'Call Done', 'Cancelled'], default: 'Scheduled' },
    type: { type: String, enum: ['doctor', 'pharmacy', 'both'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MR' },
},
    { timestamps: true });

export default mongoose.model('ScheduleCall', scheduleCallSchema);