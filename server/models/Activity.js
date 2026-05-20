const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  name: { type: String, required: true },
  cost: { type: Number, default: 0 },
  date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
