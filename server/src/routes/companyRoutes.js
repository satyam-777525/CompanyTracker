import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { optionalAuth } from '../middlewares/optionalAuth.js';
import { validate, companySchemas } from '../validators/schemas.js';
import { ROLES } from '../config/constants.js';
import * as companyController from '../controllers/companyController.js';

const router = Router();

router.get('/', optionalAuth, companyController.getCompanies);
router.get('/:slug', optionalAuth, companyController.getCompany);
router.post('/', protect, authorize(ROLES.ADMIN), validate(companySchemas.create), companyController.createCompany);
router.put('/:id', protect, authorize(ROLES.ADMIN), validate(companySchemas.update), companyController.updateCompany);
router.delete('/:id', protect, authorize(ROLES.ADMIN), companyController.deleteCompany);

export default router;
