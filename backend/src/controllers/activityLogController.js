const ActivityLog = require('../models/activityLogModel');
const { Employee } = require('../models/userModel');

/**
 * POST /api/organization/log-activity
 * Log an employee's action (from frontend)
 */
exports.logActivityFromFrontend = async (req, res) => {
    try {
        const { activityType, targetId, targetType, targetName, status, notes } = req.body;

        // Employee tokens have role:'organization' + orgType:'employee'
        // Organization tokens have role:'organization' (no orgType)
        const isEmployee = req.user.orgType === 'employee';

        if (!isEmployee) {
            return res.status(403).json({
                success: false,
                message: 'Only employees can log activities via this endpoint'
            });
        }

        // organizationId and employeeId come directly from the JWT token
        const organizationId = req.user.organizationId;
        const employeeId = req.user.employeeId || req.user.userId || req.user.id;

        if (!organizationId || !employeeId) {
            return res.status(400).json({
                success: false,
                message: 'Incomplete employee token: missing organizationId or employeeId'
            });
        }

        // Fetch employee name/email from DB
        const employee = await Employee.findById(employeeId).select('name email');
        const employeeName = employee?.name || req.user.email || 'Unknown';
        const employeeEmail = employee?.email || req.user.email || '';

        const activity = new ActivityLog({
            organizationId,
            employeeId,
            employeeName,
            employeeEmail,
            activityType,
            targetId,
            targetType,
            targetName,
            status,
            notes
        });

        await activity.save();

        res.status(201).json({
            success: true,
            data: activity
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to log activity',
            error: error.message
        });
    }
};

/**
 * Log employee activity (verification, blog moderation)
 */
exports.logActivity = async (organizationId, employeeId, employeeName, employeeEmail, activityType, targetId, targetType, targetName, status = 'pending', notes = '') => {
    try {
        const activity = new ActivityLog({
            organizationId,
            employeeId,
            employeeName,
            employeeEmail,
            activityType,
            targetId,
            targetType,
            targetName,
            status,
            notes
        });
        await activity.save();
        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
        return null;
    }
};

/**
 * GET /api/organization/employee-work-summary
 * Get summary of work done by each employee
 */
exports.getEmployeeWorkSummary = async (req, res) => {
    try {
        const organizationId = req.user.roleId; // Organization ID from auth middleware

        // Get all employees
        const employees = await Employee.find({ 
            organizationId,
            isDeleted: false 
        }).select('_id name email');

        // Get all activities for this organization
        const activities = await ActivityLog.find({ organizationId });

        // Group activities by employee
        const workSummary = employees.map(emp => {
            const empActivities = activities
                .filter(a => a.employeeId.toString() === emp._id.toString())
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            const verifications = empActivities.filter(a => a.activityType.includes('verification'));
            const blogModeration = empActivities.filter(a => a.activityType.includes('blog'));

            return {
                employeeId: emp._id,
                employeeName: emp.name,
                employeeEmail: emp.email,
                totalActions: empActivities.length,
                verifications: {
                    total: verifications.length,
                    approved: verifications.filter(a => a.status === 'verified').length,
                    rejected: verifications.filter(a => a.status === 'rejected').length,
                    items: verifications.map(a => ({
                        id: a._id,
                        name: a.targetName,
                        status: a.status,
                        notes: a.notes,
                        date: a.createdAt
                    }))
                },
                blogModeration: {
                    total: blogModeration.length,
                    approved: blogModeration.filter(a => a.status === 'approved').length,
                    rejected: blogModeration.filter(a => a.status === 'rejected').length,
                    flagged: blogModeration.filter(a => a.status === 'flagged').length,
                    items: blogModeration.map(a => ({
                        id: a._id,
                        title: a.targetName,
                        activityType: a.activityType,
                        status: a.status,
                        notes: a.notes,
                        date: a.createdAt
                    }))
                },
                lastActivityAt: empActivities.length > 0 ? empActivities[0].createdAt : null
            };
        });

        res.status(200).json({
            success: true,
            data: workSummary.filter(w => w.totalActions > 0) // Only show employees with activities
        });
    } catch (error) {
        console.error('Error fetching employee work summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee work summary',
            error: error.message
        });
    }
};

/**
 * GET /api/organization/employee/:employeeId/activities
 * Get detailed activities for a specific employee
 */
exports.getEmployeeActivities = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const organizationId = req.user.roleId;

        const activities = await ActivityLog.find({
            organizationId,
            employeeId
        })
        .sort({ createdAt: -1 })
        .limit(50);

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (error) {
        console.error('Error fetching employee activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee activities',
            error: error.message
        });
    }
};
