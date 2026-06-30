const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { auth } = require('../middleware/auth'); // Assuming auth middleware exists

router.get('/', auth, tripController.getTrips);
router.post('/', auth, tripController.createTrip);
router.post('/activity', auth, tripController.addActivity);
router.get('/:id', auth, tripController.getTripById);
router.put('/:id', auth, tripController.updateTrip);

module.exports = router;
