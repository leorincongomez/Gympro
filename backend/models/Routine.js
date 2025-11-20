const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: Number,
  notes: String
});

const routineSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  title: { type: String, required: true },
  description: String,
  exercises: [exerciseSchema],
  schedule: {
    type: { type: String, enum: ['weekly', 'daily', 'custom'], default: 'weekly' },
    days: [String],
    startDate: Date,
    endDate: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);