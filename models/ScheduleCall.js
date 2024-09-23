import mongoose from 'mongoose';

const scheduleCallSchema = new mongoose.Schema({
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    reschedule: { type: Boolean, default: false },
    updateStatus: { type: String, enum: ['Scheduled', 'Call Done', 'Cancelled'], default: 'Scheduled' },
    type: { type: String, enum: ['doctor', 'pharmacy', 'both'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MR' },
},
    { timestamps: true });

    scheduleCallSchema.index({ date: 1, type: 1, createdBy: 1 });

export default mongoose.model('ScheduleCall', scheduleCallSchema);