const express = require('express');
const router = express.Router();
const {
    getUsersList,
    getUserGrowth,
    getDietitiansList,
    getVerifyingOrganizations,
    getAllOrganizations,
    getAllCorporatePartners,
    getActiveDietPlans,
    getSubscriptions,
    getMembershipRevenue,
    getConsultationRevenue,
    getRevenueAnalytics
} = require('../controllers/analyticsController');

// Analytics routes
router.get('/users-list', getUsersList);
router.get('/user-growth', getUserGrowth);
router.get('/dietitian-list', getDietitiansList);
router.get('/verifying-organizations', getVerifyingOrganizations);
router.get('/organizations-list', getAllOrganizations);
router.get('/corporate-partners-list', getAllCorporatePartners);
router.get('/active-diet-plans', getActiveDietPlans);
router.get('/subscriptions', getSubscriptions);
router.get('/membership-revenue', getMembershipRevenue);
router.get('/consultation-revenue', getConsultationRevenue);
router.get('/revenue-analytics', getRevenueAnalytics);

module.exports = router;
