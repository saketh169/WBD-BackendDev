const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
    uploadUserProfileImage,
    uploadAdminProfileImage,
    uploadDietitianProfileImage,
    uploadOrganizationProfileImage,
    getUserProfileImage,
    getAdminProfileImage,
    getDietitianProfileImage,
    getOrganizationProfileImage,
    getUserDetails,
    getDietitianDetails,
    getAdminDetails,
    getOrganizationDetails,
    updateUserProfile
} = require('../controllers/profileController');

// Profile Image Upload Routes - No authentication required for now
router.post('/uploaduser', upload.single('profileImage'), uploadUserProfileImage);
router.post('/uploadadmin', upload.single('profileImage'), uploadAdminProfileImage);
router.post('/uploaddietitian', upload.single('profileImage'), uploadDietitianProfileImage);
router.post('/uploadorganization', upload.single('profileImage'), uploadOrganizationProfileImage);

// Profile Image Retrieval Routes
router.get('/getuser', getUserProfileImage);
router.get('/getadmin', getAdminProfileImage);
router.get('/getdietitian', getDietitianProfileImage);
router.get('/getorganization', getOrganizationProfileImage);

// Unified User Details Routes - Role-specific naming with matching controller functions
// These will automatically detect the role from the JWT token
router.get('/getuserdetails', getUserDetails);
router.get('/getdietitiandetails', getDietitianDetails);
router.get('/getadmindetails', getAdminDetails);
router.get('/getorganizationdetails', getOrganizationDetails);

// Update Profile Route - Works for all roles
router.put('/update-profile', updateUserProfile);

// Subscription Status Route
const { getSubscriptionStatus } = require('../middlewares/subscriptionMiddleware');
const { authenticateJWT } = require('../middlewares/authMiddleware');
router.get('/subscription-status', authenticateJWT, getSubscriptionStatus);


module.exports = router;
