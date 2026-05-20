const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  destinations: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  budget: { type: Number, default: 0 },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
