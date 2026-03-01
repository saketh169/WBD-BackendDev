const express = require('express');
const router = express.Router();
const {
    getDietitianStatus,
    getOrganizationStatus,
    getEmployeeOrgStatus
} = require('../controllers/statusController');

// Dietitian routes
router.get('/dietitian-status', getDietitianStatus);

// Organization routes
router.get('/organization-status', getOrganizationStatus);

// Employee routes - check parent organization verification
router.get('/employee-org-status', getEmployeeOrgStatus);


module.exports = router;
