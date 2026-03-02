const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllQueries,
  replyToQuery,
  getEmployeeQueries,
  employeeReply,
} = require('../controllers/contactusController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

// Middleware to restrict to organisation admin role (not employees)
const requireOrganization = (req, res, next) => {
  if (req.user.role !== 'organization') {
    return res.status(403).json({ success: false, message: 'Access denied. Organizations only.' });
  }
  if (req.user.orgType === 'employee') {
    return res.status(403).json({ success: false, message: 'Access denied. Organization admins only.' });
  }
  next();
};

// POST route for submitting contact queries
router.post('/submit', submitContact);

// GET route for fetching all queries (admin only)
router.get('/queries-list', getAllQueries);

// POST route for admin to reply to a query
router.post('/reply', replyToQuery);

// POST route for employee to reply to an admin response
router.post('/emp-reply', authenticateJWT, employeeReply);

// GET route for org to fetch pending employee queries
router.get('/employee-queries', authenticateJWT, requireOrganization, getEmployeeQueries);

module.exports = router;