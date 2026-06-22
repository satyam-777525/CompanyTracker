import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { optionalAuth } from '../middlewares/optionalAuth.js';
import { validate, questionSchemas } from '../validators/schemas.js';
import { ROLES } from '../config/constants.js';
import * as questionController from '../controllers/questionController.js';

const router = Router();

router.get('/search', optionalAuth, questionController.globalSearch);
router.get('/company/:slug', optionalAuth, questionController.getQuestions);
router.get('/', optionalAuth, questionController.getQuestions);
router.get('/:id', optionalAuth, questionController.getQuestion);
router.post('/', protect, authorize(ROLES.ADMIN), validate(questionSchemas.create), questionController.createQuestion);
router.put('/:id', protect, authorize(ROLES.ADMIN), validate(questionSchemas.update), questionController.updateQuestion);
router.delete('/:id', protect, authorize(ROLES.ADMIN), questionController.deleteQuestion);

export default router;
