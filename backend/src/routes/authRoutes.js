const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const forgotPasswordController = require('../controllers/forgotPasswordController');
const upload = require('../middlewares/uploadMiddleware');

/**
 * Middleware utility to explicitly set req.params.role based on the route path.
 */
const injectRole = (role) => (req, res, next) => {
    req.params.role = role;
    next();
};

// 1. User Signup Route: POST /api/signup/user
router.post('/signup/user',
    injectRole('user'),
    authController.signupController
);

// 2. Admin Signup Route: POST /api/signup/admin
router.post('/signup/admin',
    injectRole('admin'),
    authController.signupController
);

// 3. Dietitian Signup Route: POST /api/signup/dietitian
router.post('/signup/dietitian',
    injectRole('dietitian'),
    authController.signupController
);

// 4. Organization Signup Route: POST /api/signup/organization
router.post('/signup/organization',
    injectRole('organization'),
    authController.signupController
);


// 6. User Signin Route: POST /api/signin/user
router.post('/signin/user',
    injectRole('user'),
    authController.signinController
);

// 7. Admin Signin Route: POST /api/signin/admin
router.post('/signin/admin',
    injectRole('admin'),
    authController.signinController
);

// 8. Dietitian Signin Route: POST /api/signin/dietitian
router.post('/signin/dietitian',
    injectRole('dietitian'),
    authController.signinController
);

// 9. Organization Signin Route: POST /api/signin/organization
router.post('/signin/organization',
    injectRole('organization'),
    authController.signinController
);


// 11. Dietitian Document Upload: POST /api/documents/upload/dietitian
router.post('/documents/upload/dietitian',
    injectRole('dietitian'),
    upload.any(), // Accept multiple files with any field names
    authController.docUploadController
);

// 12. Organization Document Upload: POST /api/documents/upload/organization
router.post('/documents/upload/organization',
    injectRole('organization'),
    upload.any(),
    authController.docUploadController
);


// 14. Verify Token: GET /api/verify-token (Check if JWT is valid/expired)
router.get('/verify-token', authController.verifyTokenController);

// 15. Change Password: POST /api/change-password (Update user password)
router.post('/change-password', authController.changePasswordController);

// 16. Forgot Password: POST /api/forgot-password/:role (Send OTP to email for specific role)
router.post('/forgot-password/:role', forgotPasswordController.forgotPasswordController);

// 17. Reset Password: POST /api/reset-password/:role (Reset password with OTP for specific role)
router.post('/reset-password/:role', forgotPasswordController.resetPasswordController);

// 18. Verify Login OTP: POST /api/verify-login-otp/:role (2FA - verify OTP and get JWT)
router.post('/verify-login-otp/:role', authController.verifyLoginOTPController);

// 19. Resend Login OTP: POST /api/resend-login-otp (2FA - resend OTP)
router.post('/resend-login-otp', authController.resendLoginOTPController);

module.exports = router;
