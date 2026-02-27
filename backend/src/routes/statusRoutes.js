const express = require('express');
const router = express.Router();
const {
    getDietitianStatus,
    getOrganizationStatus
} = require('../controllers/statusController');

// Dietitian routes
router.get('/dietitian-status', getDietitianStatus);

// Organization routes
router.get('/organization-status', getOrganizationStatus);


module.exports = router;
