const express = require('express');
const router = express.Router();
const {
    submitLabReport,
    getClientLabReports,
    getLabReportsByClient,
    updateLabReportStatus,
    uploadFields
} = require('../controllers/labReportController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

// Submit lab report (client)
router.post('/lab/submit', uploadFields, submitLabReport);

// Get lab reports for a client (filtered by client and dietitian)
router.get('/client/:clientId/dietitian/:dietitianId', getClientLabReports);

// Get lab reports for a specific client (for dietitians)
router.get('/lab/client/:clientId', getLabReportsByClient);

// Update lab report status (for dietitians) - requires authentication
router.put('/lab/:reportId/status', authenticateJWT, updateLabReportStatus);

module.exports = router;