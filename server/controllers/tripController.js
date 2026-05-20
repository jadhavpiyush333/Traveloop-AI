const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

// Get all trips for a user
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const newTrip = new Trip({ ...req.body, userId: req.user.id });
    const savedTrip = await newTrip.save();
    res.json(savedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add activity and update budget (real-time handled via socket.io)
exports.addActivity = async (req, res) => {
  try {
    const { tripId, name, cost, date } = req.body;
    const activity = new Activity({ tripId, name, cost, date });
    await activity.save();

    const trip = await Trip.findById(tripId);
    trip.budget += cost;
    trip.activities.push(activity._id);
    await trip.save();

    // Emit real-time budget update
    const io = req.app.get('io');
    if (io) {
      io.emit(`budgetUpdate-${tripId}`, { newBudget: trip.budget, activity });
    }

    res.json({ trip, activity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
