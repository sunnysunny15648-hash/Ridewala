const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getRideHistory } = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { requireCustomer } = require('../middleware/roles');

router.use(protect, requireCustomer);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/rides', getRideHistory);

module.exports = router;

