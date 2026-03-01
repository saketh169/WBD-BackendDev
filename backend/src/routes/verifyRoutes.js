const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    validateDietitianObjectId,
    validateOrganizationObjectId,
    handleMulterError,
    ensureOrganizationAuthenticated
} = require('../middlewares/authMiddleware');
const {
    getDietitians,
    getDietitianFile,
    approveDietitianDocument,
    disapproveDietitianDocument,
    finalApproveDietitian,
    finalDisapproveDietitian,
    uploadDietitianFinalReport,
    getCurrentDietitian,
    checkDietitianStatus,
    getOrganizations,
    getOrganizationFile,
    approveOrganizationDocument,
    disapproveOrganizationDocument,
    finalApproveOrganization,
    finalDisapproveOrganization,
    uploadOrganizationFinalReport,
    getCurrentOrganization,
    checkOrganizationStatus
} = require('../controllers/verifyController');

// Multer configuration for final report upload
const reportUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF is allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file allowed
    }
}).single('finalReport');


// Multer configuration for organization final report upload
const orgReportUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF is allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file allowed
    }
}).single('finalReport');


// Dietitian Routes (protected by organization authentication)
router.get('/dietitians', ensureOrganizationAuthenticated, getDietitians);
router.get('/files/:dietitianId/:field', ensureOrganizationAuthenticated, validateDietitianObjectId, getDietitianFile);
router.post('/:dietitianId/approve', ensureOrganizationAuthenticated, validateDietitianObjectId, approveDietitianDocument);
router.post('/:dietitianId/disapprove', ensureOrganizationAuthenticated, validateDietitianObjectId, disapproveDietitianDocument);
router.post('/:dietitianId/final-approve', ensureOrganizationAuthenticated, validateDietitianObjectId, finalApproveDietitian);
router.post('/:dietitianId/final-disapprove', ensureOrganizationAuthenticated, validateDietitianObjectId, finalDisapproveDietitian);
router.post('/:dietitianId/upload-report', ensureOrganizationAuthenticated, validateDietitianObjectId, reportUpload, handleMulterError, uploadDietitianFinalReport);
router.get('/me', getCurrentDietitian);
router.get('/check-status', checkDietitianStatus);

// Organization Routes (admin only for verifying organizations)
router.get('/organizations', getOrganizations);
router.get('/org/files/:orgId/:field', validateOrganizationObjectId, getOrganizationFile);
router.post('/org/:orgId/approve', validateOrganizationObjectId, approveOrganizationDocument);
router.post('/org/:orgId/disapprove', validateOrganizationObjectId, disapproveOrganizationDocument);
router.post('/org/:orgId/final-approve', validateOrganizationObjectId, finalApproveOrganization);
router.post('/org/:orgId/final-disapprove', validateOrganizationObjectId, finalDisapproveOrganization);
router.post('/org/:orgId/upload-report', validateOrganizationObjectId, orgReportUpload, handleMulterError, uploadOrganizationFinalReport);
router.get('/org/me', getCurrentOrganization);
router.get('/org/check-status', checkOrganizationStatus);

module.exports = router;
