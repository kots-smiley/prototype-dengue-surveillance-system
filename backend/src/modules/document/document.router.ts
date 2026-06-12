import { Router } from 'express';
import { documentController } from './document.controller';
import { createDocumentSchema, listDocumentQuerySchema } from './document.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listDocumentQuerySchema, 'query'), asyncHandler(documentController.list));
router.post('/', validate(createDocumentSchema), asyncHandler(documentController.create));
router.delete('/:id', asyncHandler(documentController.remove));

export default router;
