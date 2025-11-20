const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: String,
  phone: String,
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  metrics: {
    weight: Number,
    height: Number,
    bodyFat: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);