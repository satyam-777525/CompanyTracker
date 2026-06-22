import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { validate, noteSchemas } from '../validators/schemas.js';
import * as noteController from '../controllers/noteController.js';

const router = Router();

router.use(protect);

router.get('/', noteController.getAllNotes);
router.get('/:questionId', noteController.getNote);
router.put('/:questionId', validate(noteSchemas.upsert), noteController.upsertNote);
router.delete('/:questionId', noteController.deleteNote);

export default router;
