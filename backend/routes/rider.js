const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateLocation,
  toggleAvailability,
  getEarnings,
  getRideHistory,
} = require('../controllers/riderController');
const { protect } = require('../middleware/auth');
const { requireRider } = require('../middleware/roles');

router.use(protect, requireRider);

router.get('/profile', getProfile);
router.put('/location', updateLocation);
router.patch('/availability', toggleAvailability);
router.get('/earnings', getEarnings);
router.get('/rides', getRideHistory);

module.exports = router;

