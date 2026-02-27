const express = require('express');
const router = express.Router();
const {
    getUsersList,
    getUserGrowth,
    getDietitiansList,
    getVerifyingOrganizations,
    getAllOrganizations,
    getActiveDietPlans,
    getSubscriptions,
    getMembershipRevenue,
    getConsultationRevenue,
    getRevenueAnalytics,
    getDietitianRevenue,
    getUserRevenue
} = require('../controllers/analyticsController');

// Analytics routes
router.get('/users-list', getUsersList);
router.get('/user-growth', getUserGrowth);
router.get('/dietitian-list', getDietitiansList);
router.get('/verifying-organizations', getVerifyingOrganizations);
router.get('/organizations-list', getAllOrganizations);
router.get('/active-diet-plans', getActiveDietPlans);
router.get('/subscriptions', getSubscriptions);
router.get('/membership-revenue', getMembershipRevenue);
router.get('/consultation-revenue', getConsultationRevenue);
router.get('/revenue-analytics', getRevenueAnalytics);
router.get('/dietitian-revenue', getDietitianRevenue);
router.get('/user-revenue', getUserRevenue);

module.exports = router;
