const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateJWT } = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configure multer for CSV file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || 
            file.mimetype === 'application/csv' ||
            file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// All routes require authentication and organization role
router.use(authenticateJWT);

// Middleware to check if user is organization
const requireOrganization = (req, res, next) => {
    if (req.user.role !== 'organization') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Only organizations can manage employees.'
        });
    }
    next();
};

router.use(requireOrganization);

// Employee CRUD Routes

// GET /api/employees/stats - Get employee statistics
router.get('/stats', employeeController.getEmployeeStats);

// GET /api/employees - Get all employees
router.get('/', employeeController.getAllEmployees);

// GET /api/employees/:id - Get single employee
router.get('/:id', employeeController.getEmployeeById);

// POST /api/employees/add - Add single employee
router.post('/add', employeeController.addEmployee);

// POST /api/employees/bulk-upload - Bulk upload employees from CSV
router.post('/bulk-upload', upload.single('csvFile'), employeeController.bulkUploadEmployees);

// PUT /api/employees/:id - Update employee
router.put('/:id', employeeController.updateEmployee);

// PATCH /api/employees/:id/inactive - Mark employee as inactive
router.patch('/:id/inactive', employeeController.inactivateEmployee);

// PATCH /api/employees/:id/active - Mark employee as active
router.patch('/:id/active', employeeController.activateEmployee);

// DELETE /api/employees/:id - Permanently remove employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
