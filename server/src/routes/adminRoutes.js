import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { ROLES } from '../config/constants.js';
import { uploadCSV } from '../middlewares/upload.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.get('/stats', adminController.getPlatformStats);
router.get('/leaderboard', adminController.getLeaderboard);

router.use(protect);
router.get('/dashboard', authorize(ROLES.ADMIN), adminController.getDashboard);
router.post('/import-csv', authorize(ROLES.ADMIN), uploadCSV.single('file'), adminController.importCSV);

export default router;
