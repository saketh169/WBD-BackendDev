const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const Employee = require('../models/userModel').Employee;
const Organization = require('../models/userModel').Organization;
const { sendEmail } = require('../services/emailService');
const { ensureOrganizationAuthenticated } = require('../middlewares/authMiddleware');

// Multer for CSV upload
const upload = multer({ dest: 'uploads/' });

// Get employees for the organization
router.get('/employees', ensureOrganizationAuthenticated, async (req, res) => {
    try {
        const orgId = req.user.employeeId ? req.user.organizationId : req.user.roleId;
        const employees = await Employee.find({ organizationId: orgId });
        res.json({ employees });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload CSV to create employees
router.post('/upload-employees', ensureOrganizationAuthenticated, upload.single('csv'), async (req, res) => {
    try {
        const orgId = req.user.employeeId ? req.user.organizationId : req.user.roleId;
        if (req.user.employeeId) {
            return res.status(403).json({ message: 'Only management can upload employees' });
        }
        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                const employees = [];
                for (const row of results) {
                    const password = Math.random().toString(36).slice(-8); // Generate random password
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const employee = new Employee({
                        name: row.name,
                        email: row.email,
                        passwordHash: hashedPassword,
                        licenseNumber: row.licenseNumber,
                        organizationId: orgId,
                        employeeRole: row.employeeRole || 'verifier',
                        status: 'active'
                    });
                    await employee.save();
                    employees.push(employee);

                    // Send email with credentials
                    await sendEmail(row.email, 'Employee Account Created', `Your login credentials: Email: ${row.email}, Password: ${password}, License: ${row.licenseNumber}`);
                }
                fs.unlinkSync(req.file.path); // Remove temp file
                res.json({ message: 'Employees created', employees });
            });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add single employee
router.post('/employee', ensureOrganizationAuthenticated, async (req, res) => {
    try {
        if (req.user.employeeId) {
            return res.status(403).json({ message: 'Only management can add employees' });
        }
        const orgId = req.user.roleId;
        const { name, email, licenseNumber, employeeRole } = req.body;

        // Generate password
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        const employee = new Employee({
            name,
            email,
            licenseNumber,
            passwordHash: hashedPassword,
            organizationId: orgId,
            employeeRole: employeeRole || 'verifier',
            status: 'active'
        });
        await employee.save();

        // Send email
        await sendEmail(email, 'Employee Account Created', `Your login credentials:\nEmail: ${email}\nPassword: ${password}\nLicense: ${licenseNumber}`);

        res.json({ message: 'Employee added', employee });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update employee
router.put('/employee/:id', ensureOrganizationAuthenticated, async (req, res) => {
    try {
        if (req.user.employeeId) {
            return res.status(403).json({ message: 'Only management can update employees' });
        }
        const orgId = req.user.roleId;
        const employee = await Employee.findOneAndUpdate(
            { _id: req.params.id, organizationId: orgId },
            req.body,
            { new: true }
        );
        res.json({ employee });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove employee
router.delete('/employee/:id', ensureOrganizationAuthenticated, async (req, res) => {
    try {
        if (req.user.employeeId) {
            return res.status(403).json({ message: 'Only management can remove employees' });
        }
        const orgId = req.user.roleId;
        await Employee.findOneAndDelete({ _id: req.params.id, organizationId: orgId });
        res.json({ message: 'Employee removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;