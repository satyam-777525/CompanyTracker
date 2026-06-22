import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { validate, progressSchemas } from '../validators/schemas.js';
import * as progressController from '../controllers/progressController.js';

const router = Router();

router.use(protect);

router.get('/dashboard', progressController.getDashboard);
router.get('/bookmarks', progressController.getBookmarks);
router.get('/revisions', progressController.getRevisions);
router.get('/calendar', progressController.getStudyCalendar);
router.get('/export', progressController.exportProgress);
router.put('/:questionId', validate(progressSchemas.update), progressController.updateProgress);

export default router;
