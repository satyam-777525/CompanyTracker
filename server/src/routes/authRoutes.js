import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { validate, authSchemas } from '../validators/schemas.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/register', validate(authSchemas.register), authController.register);
router.post('/login', validate(authSchemas.login), authController.login);
router.post('/forgot-password', validate(authSchemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authSchemas.resetPassword), authController.resetPassword);
router.get('/profile/:id', authController.getPublicProfile);
router.get('/me', protect, authController.getProfile);
router.put('/me', protect, validate(authSchemas.updateProfile), authController.updateProfile);
router.post('/logout', protect, authController.logout);

export default router;
