const express = require('express');
const router = express.Router();
const { ensureOrganizationAuthenticated, authenticateJWT } = require('../middlewares/authMiddleware');
const {
    logActivityFromFrontend,
    getEmployeeWorkSummary,
    getEmployeeActivities
} = require('../controllers/activityLogController');

// POST /api/organization/log-activity - Log an activity (employees can call this)
router.post('/log-activity', authenticateJWT, logActivityFromFrontend);

// Routes requiring organization authentication
router.use(ensureOrganizationAuthenticated);

// GET /api/organization/employee-work-summary - Get summary of all employee work
router.get('/employee-work-summary', getEmployeeWorkSummary);

// GET /api/organization/employee/:employeeId/activities - Get detailed activities for specific employee
router.get('/employee/:employeeId/activities', getEmployeeActivities);

module.exports = router;
