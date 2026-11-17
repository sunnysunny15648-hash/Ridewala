const express = require('express');
const router = express.Router();
const { createRating, getRiderRatings } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');
const { requireCustomer } = require('../middleware/roles');

router.post('/', protect, requireCustomer, createRating);
router.get('/rider/:id', getRiderRatings);

module.exports = router;

