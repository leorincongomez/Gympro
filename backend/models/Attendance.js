const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  routineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['done', 'missed', 'rescheduled'], default: 'done' },
  notes: String
}, { timestamps: true });

attendanceSchema.index({ clientId: 1, date: 1 }, { unique: true }); // evita duplicados por día

module.exports = mongoose.model('Attendance', attendanceSchema);