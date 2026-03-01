const express = require('express');
const router = express.Router();
const {
    createHealthReport,
    getHealthReports,
    getDietitianHealthReports,
    getClientHealthReports,
    markHealthReportViewed,
    healthReportUploadFields
} = require('../controllers/healthReportController');

// Create health report (dietitian sends to client)
router.post('/create', healthReportUploadFields, createHealthReport);

// Get health reports for a client from a specific dietitian
router.get('/client/:clientId/dietitian/:dietitianId', getHealthReports);

// Get all health reports sent by a dietitian (optionally filtered by clientId)
router.get('/dietitian/:dietitianId/client/:clientId', getDietitianHealthReports);

// Get all health reports for a client
router.get('/client/:clientId', getClientHealthReports);

// Mark report as viewed
router.put('/:reportId/viewed', markHealthReportViewed);

module.exports = router;
