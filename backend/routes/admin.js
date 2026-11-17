const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getCustomers,
  updateCustomerStatus,
  getRiders,
  updateRiderApproval,
  getAllRides,
  updatePricing,
  getPricing,
  getReports,
  exportCSV,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');

router.use(protect, requireAdmin);

router.get('/dashboard', getDashboard);

router.get('/customers', getCustomers);
router.patch('/customers/:id/status', updateCustomerStatus);

router.get('/riders', getRiders);
router.patch('/riders/:id/approval', updateRiderApproval);

router.get('/rides', getAllRides);

router.get('/pricing', getPricing);
router.put('/pricing', updatePricing);

router.get('/reports', getReports);
router.get('/reports/export', exportCSV);

module.exports = router;

