const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: String,
  phone: String,
  specialties: [String],
  bio: String,
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }]
}, { timestamps: true });

module.exports = mongoose.model('Trainer', trainerSchema);